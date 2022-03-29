import { IExecuteFunctions } from 'n8n-core';

import { IDataObject, INodeExecutionData, INodeType, INodeTypeDescription, LoggerProxy as Logger } from 'n8n-workflow';

import { appointmentFields, appointmentOperations } from './descriptions';
import { perfectMindApiRequest } from './GenericFunctions';

export class PerfectMind implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PerfectMind',
		name: 'PerfectMind',
		icon: 'file:PerfectMind.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ":" + $parameter["resource"]}}',
		description: 'Consume PerfectMind\'s API',
		defaults: {
			name: 'PerfectMind',
			color: '#003594',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'PerfectMindApi',
				required: true,
			},
		],
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Appointment',
						value: 'appointment',
					},
				],
				default: 'contact',
				required: true,
				description: 'resource in PerfectMind',
			},
			// Appointment
			...appointmentOperations,
			...appointmentFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let responseData;
		const returnData: IDataObject[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('PerfectMindApi') as IDataObject;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'appointment') {
					if (operation === 'get') {
						const startTime = this.getNodeParameter('startTime', i) as string;
						const endTime = this.getNodeParameter('endTime', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const qs = {
							pageSize : additionalFields?.pageSize,
							page : additionalFields?.page,
							startTime,
							endTime,
						} as IDataObject;

						responseData = await perfectMindApiRequest.call(this, 'GET', `/Organizations/${credentials.clientNumber}/Appointments`, {}, qs);
						if (additionalFields.paginationData === false){
							responseData = responseData.Result;
						}
					}
				}
				if (Array.isArray(responseData)) {
					returnData.push.apply(returnData, responseData as IDataObject[]);
				} else if (responseData !== undefined) {
					returnData.push(responseData as IDataObject);
				}
			}catch (error) {
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
