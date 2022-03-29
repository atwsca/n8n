import {
	OptionsWithUri,
} from 'request';

import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import {
	IDataObject, NodeApiError, NodeOperationError,
} from 'n8n-workflow';

export async function perfectMindApiRequest(this: IExecuteFunctions | ILoadOptionsFunctions, method : string, resource : string, body: any = {}, qs: IDataObject = {}, option: IDataObject = {}, headers: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
		const credentials = await this.getCredentials('PerfectMindApi') as IDataObject;

		if (credentials === undefined) {
		throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
	}

		const options: OptionsWithUri = {
				headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'X-Client-Number': `${credentials.clientNumber}`,
						'X-Access-Key': `${credentials.apiKey}`,
					},
				method,
				body,
				qs,
				uri: `https://${credentials.subDomain}.perfectmind.com/api/${credentials.apiVersion}${resource}`,
				json: true,
		};

		try {
			if (Object.keys(headers).length !== 0) {
			options.headers = Object.assign({}, options.headers, headers);
		}

		if (Object.keys(body).length === 0) {
			delete options.body;
		}

		if (!Object.keys(qs).length) {
			delete options.qs;
		}

		if (Object.keys(option)) {
			Object.assign(options, option);
		}

			//@ts-ignore
			const response = await this.helpers.request!(options);
			return response;
		} catch (error) {
				throw new NodeApiError(this.getNode(), error);
		}
}
