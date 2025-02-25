import { IExecuteFunctions } from 'n8n-core';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';


import { DiscordAttachment, DiscordWebhook } from './Interfaces';
export class Discord implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Discord',
		name: 'discord',
		icon: 'file:discord.svg',
		group: ['output'],
		version: 1,
		description: 'Sends data to Discord',
		defaults: {
			name: 'Discord',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties:[
			{
				displayName: 'Webhook URL',
				name: 'webhookUri',
				type: 'string',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				required: true,
				default: '',
				placeholder: 'https://discord.com/api/webhooks/ID/TOKEN',
			},
			{
				displayName: 'Content',
				name: 'text',
				type: 'string',
				typeOptions: {
					maxValue: 2000,
					alwaysOpenEditWindow: true,
				},
				default: '',
				required: false,
				placeholder: 'Hello World!',
			},
			{
				displayName: 'Additional Fields',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Allowed Mentions',
						name: 'allowedMentions',
						type: 'json',
						typeOptions: { alwaysOpenEditWindow: true, editor: 'code' },
						default: '',
					},
					{
						displayName: 'Attachments',
						name: 'attachments',
						type: 'json',
						typeOptions: { alwaysOpenEditWindow: true, editor: 'code' },
						default: '',
					},
					{
						displayName: 'Avatar URL',
						name: 'avatarUrl',
						type: 'string',
						default: '',
						required: false,
					},
					{
						displayName: 'Components',
						name: 'components',
						type: 'json',
						typeOptions: { alwaysOpenEditWindow: true, editor: 'code' },
						default: '',
					},
					{
						displayName: 'Embeds',
						name: 'embeds',
						type: 'json',
						typeOptions: { alwaysOpenEditWindow: true, editor: 'code' },
						default: '',
						required: false,
					},
					{
						displayName: 'Flags',
						name: 'flags',
						type: 'number',
						default: '',
					},
					{
						displayName: 'JSON Payload',
						name: 'payloadJson',
						type: 'json',
						typeOptions: { alwaysOpenEditWindow: true, editor: 'code' },
						default: '',
					},
					{
						displayName: 'Username',
						name: 'username',
						type: 'string',
						default: '',
						required: false,
						placeholder: 'User',
					},
					{
						displayName: 'TTS',
						name: 'tts',
						type: 'boolean',
						default: false,
						required: false,
						description: 'Should this message be sent as a Text To Speech message?',
					},
				],
			},
		],
	};



	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: IDataObject[] = [];

		const webhookUri = this.getNodeParameter('webhookUri', 0, '') as string;

		if (!webhookUri) throw Error('Webhook uri is required.');

		const items = this.getInputData();
		const length = items.length as number;
		for (let i = 0; i < length; i++) {
			const body: DiscordWebhook = {};

			const webhookUri = this.getNodeParameter('webhookUri', i) as string;
			body.content = this.getNodeParameter('text', i) as string;
			const options = this.getNodeParameter('options', i) as IDataObject;

			if (!body.content && !options.embeds) {
				throw new Error('Either content or embeds must be set.');
			}
			if (options.embeds) {
				try {
					//@ts-expect-error
					body.embeds = JSON.parse(options.embeds);
					if (!Array.isArray(body.embeds)) {
						throw new Error('Embeds must be an array of embeds.');
					}
				} catch (e) {
					throw new Error('Embeds must be valid JSON.');
				}
			}
			if (options.username) {
					body.username = options.username as string;
			}

			if (options.components) {
				try {
					//@ts-expect-error
					body.components = JSON.parse(options.components);
				} catch (e) {
					throw new Error('Components must be valid JSON.');
				}
			}

			if (options.allowed_mentions) {
					//@ts-expect-error
					body.allowed_mentions = JSON.parse(options.allowed_mentions);
			}

			if (options.avatarUrl) {
				body.avatar_url = options.avatarUrl as string;
			}

			if (options.flags) {
				body.flags = options.flags as number;
			}

			if (options.tts) {
				body.tts = options.tts as boolean;
			}

			if (options.payloadJson) {
				//@ts-expect-error
				body.payload_json = JSON.parse(options.payloadJson);
			}

			if (options.attachments) {
				//@ts-expect-error
				body.attachments = JSON.parse(options.attachments as DiscordAttachment[]);
			}

			//* Not used props, delete them from the payload as Discord won't need them :^
			if (!body.content) delete body.content;
			if (!body.username) delete body.username;
			if (!body.avatar_url) delete body.avatar_url;
			if (!body.embeds) delete body.embeds;
			if (!body.allowed_mentions) delete body.allowed_mentions;
			if (!body.flags) delete body.flags;
			if (!body.components) delete body.components;
			if (!body.payload_json) delete body.payload_json;
			if (!body.attachments) delete body.attachments;

			let requestOptions;

			if(!body.payload_json){
				requestOptions = {
					method: 'POST',
					body,
					uri: webhookUri,
					headers: {
						'content-type': 'application/json; charset=utf-8',
					},
					json: true,
				};
			}else {
				requestOptions = {
					method: 'POST',
					body,
					uri: webhookUri,
					headers: {
						'content-type': 'multipart/form-data; charset=utf-8',
					},
				};
			}
			let maxTries = 5;
			do {
				try {
					await this.helpers.request(requestOptions);
					break;
				} catch (error) {
					if (error.statusCode === 429) {
						//* Await ratelimit to be over
						await new Promise<void>((resolve) =>
							setTimeout(resolve, error.response.body.retry_after || 150),
						);

						continue;
					}

					//* Different Discord error, throw it
					throw error;
				}
			} while (--maxTries);

			if (maxTries <= 0) {
				throw new Error(
					'Could not send Webhook message. Max. amount of rate-limit retries reached.',
				);
			}
			returnData.push({ success: true });
		}


		return [this.helpers.returnJsonArray(returnData)];
	}
}
