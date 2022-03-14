import {
	ICredentialType,
	INodeProperties,
	NodePropertyTypes,
} from 'n8n-workflow';

export class PerfectMindApi implements ICredentialType {
	name = 'PerfectMindApi';
	icon = 'file:PerfectMind.png';
	documentationUrl = 'perfectmind';
	displayName = 'PerfectMind API';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string' as NodePropertyTypes,
			default: '',
			required: true,
		},
		{
			displayName: 'API Version',
			name: 'apiVersion',
			type: 'string' as NodePropertyTypes,
			default: '2.0',
			required: true,
		},
		{
			displayName: 'Client Number',
			name: 'clientNumber',
			type: 'string' as NodePropertyTypes,
			default: '',
			required: true,
		},
		{
			displayName: 'Sub Domain',
			name: 'subDomain',
			type: 'string' as NodePropertyTypes,
			default: '',
			required: true,
		},
	];
}
