import { INodeProperties } from 'n8n-workflow';

export const appointmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['appointment'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Retrive an appointment',
			},
		],
		default: 'get',
		description: 'The operation to perform.',
	},
];

export const appointmentFields: INodeProperties[] = [
	{
		displayName: 'Start Date/Time',
		name: 'startTime',
		type: 'dateTime',
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: ['get','getAll',],
				resource: ['appointment'],
			},
		},
	},
	{
		displayName: 'End Date/Time',
		name: 'endTime',
		type: 'dateTime',
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: ['get','getAll',],
				resource: ['appointment'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [
					'appointment',
				],
				operation: [
					'get',
				],
			},
		},
		options: [
			{
				displayName: 'Pagination Data',
				name: 'paginationData',
				type: 'boolean',
				default: 'false',
			},
			{
				displayName: 'Records Per Page',
				name: 'recordsPerPage',
				type: 'number',
				default: '',
				description: 'The number of records to return per page, default returns 10 records per page',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: '0',
				description: 'The page number to return, default returns starting page 0',
			},
		],
	},
];
