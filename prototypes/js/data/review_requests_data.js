/**
*System Name: Budget Management System
*Module Name: review_requests_data
*
*Purpose of this file:
*Mock internal review queue, detail records, and version presets.
*
*Author: none
*
*Copyright (C) 2026
*by the Department of Science and Technology - Central Office
*
*All rights reserved.
*/

	var MEASURE_TITLES = {
		publication: 'Publication',
		'patent-ip': 'Patent / Intellectual Property',
		product: 'Product',
		'people-service': 'People Service',
		'place-partnership': 'Place and Partnership',
		policy: 'Policy',
		'social-impact': 'Social Impact',
		'economic-impact': 'Economic Impact'
	};

	var QUEUE_PAGE_SIZE = 5;
	var WORKFLOW_STORAGE_KEY = 'bms_br_workflow_state';

	var REVIEW_STAGE_CHAIN = [
		{ id: 'pdo', currentStage: 'PDO Review', reviewerRole: 'PDO Reviewer', reviewerName: 'Ana Reyes' },
		{ id: 'fo', currentStage: 'FO Review', reviewerRole: 'Finance Officer', reviewerName: 'Pedro Lim' }
	];

	var READY_FOR_CONSOLIDATION = {
		id: 'ready',
		currentStage: 'Ready for Consolidation'
	};

	var QUEUE_ITEMS = [
		{
			id: 'br-002',
			referenceNo: 'BR-2027-002',
			requestingUnit: 'DOST-PES',
			fiscalYear: '2027',
			projectCount: 3,
			grandTotal: 500000,
			currentStage: 'PDO Review',
			status: 'Pending',
			lastUpdated: '2026-06-27T10:30:00.000Z'
		},
		{
			id: 'br-003',
			referenceNo: 'BR-2027-003',
			requestingUnit: 'DOST Central Office',
			fiscalYear: '2027',
			projectCount: 5,
			grandTotal: 9000000,
			currentStage: 'PDO Review',
			status: 'Returned',
			lastUpdated: '2026-06-25T09:00:00.000Z'
		},
		{
			id: 'br-004',
			referenceNo: 'BR-2027-004',
			requestingUnit: 'Region VII',
			fiscalYear: '2027',
			projectCount: 2,
			grandTotal: 1800000,
			currentStage: 'FO Review',
			status: 'Pending',
			lastUpdated: '2026-06-26T16:45:00.000Z'
		},
		{
			id: 'br-005',
			referenceNo: 'BR-2026-001',
			requestingUnit: 'DOST-PES',
			fiscalYear: '2026',
			projectCount: 4,
			grandTotal: 4200000,
			currentStage: 'Ready for Consolidation',
			status: 'Reviewed',
			lastUpdated: '2026-03-15T08:00:00.000Z'
		},
		{
			id: 'br-006',
			referenceNo: 'BR-2026-002',
			requestingUnit: 'Region VII',
			fiscalYear: '2026',
			projectCount: 2,
			grandTotal: 2750000,
			currentStage: 'FO Review',
			status: 'Returned',
			lastUpdated: '2026-06-26T11:30:00.000Z'
		}
	];

	var REVIEW_REQUESTS = {
		'br-002': {
			referenceNo: 'BR-2027-002',
			title: 'FY 2027 ICT and Lab Modernisation',
			description: 'Integrated ICT upgrade and laboratory modernisation for DOST-PES research operations.',
			requestingUnit: 'DOST-PES',
			fiscalYear: '2027',
			submittedBy: 'Maria Santos',
			submittedDate: '27 Jun 2026',
			grandTotal: 500000,
			currentStage: 'PDO Review',
			status: 'Pending',
			workflowStage: 'pdo',
			attachedFiles: [
				{
					id: 'file-br001-1',
					name: 'ict-lab-supporting-memo.pdf',
					size: 312320,
					type: 'application/pdf',
					uploadedAt: '2026-06-27T08:30:00.000Z',
					uploadedBy: 'Maria Santos'
				}
			],
			justificationPosts: [
				{
					id: 'just-br001-1',
					text: 'Integrated ICT and laboratory upgrades are required to sustain DOST-PES research operations and comply with digital government service standards.',
					postedAt: '2026-06-27T08:25:00.000Z',
					postedBy: 'Maria Santos'
				}
			],
			projects: [
				{
					id: 'proj-ict',
					name: 'ICT Upgrade Program',
					programName: 'Digital Transformation Initiative',
					pillarCategory: 'Wealth creation fostered',
					description: 'Upgrade core ICT infrastructure and digital services for research operations.',
					totals: { PS: 100000, MOOE: 50000, CO: 80000, grand: 230000 },
					physicalMeasures: [
						{
							measureId: 'publication',
							entries: [
								{ particular: 'Conference Proceeding / Abstract', quantity: 2, specification: 'National ICT conference, Manila, May 2026' }
							]
						},
						{
							measureId: 'product',
							entries: [
								{ particular: 'Software Application / Digital Platform', quantity: 1, specification: 'Internal asset management portal, web-based' }
							]
						}
					],
					lineItems: {
						PS: [{ label: 'Salaries', amount: 80000, justification: 'Retain ICT operations staff for infrastructure upgrade.' }],
						MOOE: [{ label: 'Internet Subscription Expenses', amount: 30000, justification: 'Higher bandwidth for upgraded digital services.' }, { label: 'Supplies and Materials Expenses', amount: 20000, justification: 'Network cabling and installation supplies.' }],
						CO: [{ label: 'Server and network equipment', amount: 80000, justification: 'Core servers required for asset management portal.' }]
					}
				},
				{
					id: 'proj-lab',
					name: 'Lab Modernisation',
					programName: 'Research Facilities Program',
					pillarCategory: 'Human well-being',
					description: 'Modernise laboratory equipment and safety systems for applied research.',
					totals: { PS: 70000, MOOE: 60000, CO: 50000, grand: 180000 },
					physicalMeasures: [
						{
							measureId: 'product',
							entries: [
								{ particular: 'Functional Prototype / Hardware', quantity: 1, specification: 'Automated sample processing unit, TRL 6' }
							]
						}
					],
					lineItems: {
						PS: [{ label: 'Salaries', amount: 70000, justification: 'Lab technicians for modernised facility operations.' }],
						MOOE: [{ label: 'Utility Expenses', amount: 35000, justification: 'Utilities for upgraded lab systems.' }, { label: 'Repairs and Maintenance of Laboratory Facilities', amount: 25000, justification: 'Preventive maintenance for safety compliance.' }],
						CO: [{ label: 'Spectroscopy equipment', amount: 50000, justification: 'Analytical equipment for applied research.' }]
					}
				},
				{
					id: 'proj-policy',
					name: 'Policy Research Support',
					programName: 'Science Policy Analysis',
					pillarCategory: 'Strengthening and harmonizing DOST system governance',
					description: 'Support policy research and evidence-based recommendations for sector planning.',
					totals: { PS: 40000, MOOE: 30000, CO: 20000, grand: 90000 },
					physicalMeasures: [
						{
							measureId: 'policy',
							entries: [
								{ particular: 'Policy Brief / Position Paper', quantity: 1, specification: 'Science, technology, and innovation roadmap brief' }
							]
						}
					],
					lineItems: {
						PS: [{ label: 'Honoraria', amount: 40000, justification: 'Policy research consultants and subject experts.' }],
						MOOE: [{ label: 'Printing and Publication Expenses', amount: 15000, justification: 'Publication of policy brief outputs.' }, { label: 'Professional Services', amount: 15000, justification: 'External policy analysis support.' }],
						CO: [{ label: 'Laptop computers', amount: 20000, justification: 'Equipment for policy research team.' }]
					}
				}
			],
			reviewHistory: [
				{
					date: '25 Jun 2026, 3:00 pm',
					user: 'Ana Reyes',
					role: 'PDO Reviewer',
					action: 'Returned',
					reason: 'For Revision',
					target: 'Project: ICT Upgrade / LIB',
					remark: 'Missing MOOE breakdown'
				},
				{
					date: '26 Jun 2026, 11:00 am',
					user: 'Maria Santos',
					role: 'Requester',
					action: 'Resubmitted',
					reason: '-',
					target: 'Entire Request',
					remark: 'Added budget breakdown'
				},
				{
					date: '27 Jun 2026, 10:30 am',
					user: 'Ana Reyes',
					role: 'PDO Reviewer',
					action: 'Reviewed',
					reason: '-',
					target: 'Entire Request',
					remark: 'Ready for next review stage'
				}
			],
			version: {
				versionNumber: 1,
				title: 'Version 1 · Submitted Snapshot',
				submittedDate: '27 Jun 2026',
				submittedBy: 'Maria Santos',
				status: 'Submitted',
				fiscalYear: '2027',
				projectCount: 3,
				grandTotal: 500000
			}
		},
		'br-004': {
			referenceNo: 'BR-2027-004',
			title: 'FY 2027 Regional Innovation Program',
			description: 'Regional innovation hub and technology transfer package for Region VII.',
			requestingUnit: 'Region VII',
			fiscalYear: '2027',
			submittedBy: 'Juan Dela Cruz',
			submittedDate: '24 Jun 2026',
			grandTotal: 1800000,
			currentStage: 'FO Review',
			status: 'Pending',
			workflowStage: 'fo',
			attachedFiles: [
				{
					id: 'file-br004-1',
					name: 'regional-innovation-brief.pdf',
					size: 204800,
					type: 'application/pdf',
					uploadedAt: '2026-06-24T11:45:00.000Z',
					uploadedBy: 'Juan Dela Cruz'
				}
			],
			justificationPosts: [
				{
					id: 'just-br004-1',
					text: 'Regional innovation hub funding supports wealth creation and R&D capacity in Region VII.',
					postedAt: '2026-06-24T11:40:00.000Z',
					postedBy: 'Juan Dela Cruz'
				}
			],
			projects: [
				{
					id: 'proj-reg-a',
					name: 'Regional Innovation Hub',
					programName: 'Regional R&D Program',
					pillarCategory: 'Wealth creation fostered',
					description: 'Establish regional innovation hub facilities.',
					totals: { PS: 700000, MOOE: 300000, CO: 500000, grand: 1500000 },
					physicalMeasures: [],
					lineItems: {
						PS: [{ label: 'Salaries', amount: 700000, justification: 'Staffing for regional innovation hub operations.' }],
						MOOE: [{ label: 'Training and Scholarship Expenses', amount: 300000, justification: 'Capacity building for regional researchers.' }],
						CO: [{ label: 'Workshop equipment', amount: 500000, justification: 'Fabrication equipment for innovation workshops.' }]
					}
				},
				{
					id: 'proj-reg-b',
					name: 'Technology Transfer Outreach',
					programName: 'Regional Innovation Program',
					pillarCategory: 'Wealth creation fostered',
					description: 'Outreach activities for technology transfer to regional industry partners.',
					totals: { PS: 200000, MOOE: 100000, CO: 0, grand: 300000 },
					physicalMeasures: [],
					lineItems: {
						PS: [{ label: 'Honoraria', amount: 200000, justification: 'Subject matter experts for technology transfer forums.' }],
						MOOE: [{ label: 'Traveling Expenses - Local', amount: 100000, justification: 'Regional outreach and stakeholder meetings.' }],
						CO: []
					}
				}
			],
			reviewHistory: [
				{
					date: '25 Jun 2026, 2:15 pm',
					user: 'Ana Reyes',
					role: 'PDO Reviewer',
					action: 'Reviewed',
					reason: '-',
					target: 'Entire Request',
					remark: 'Forwarded to Finance Officer for review.'
				}
			]
		},
		'br-005': {
			referenceNo: 'BR-2026-001',
			title: 'FY 2026 PES Operations Package',
			description: 'Validated FY 2026 budget package for DOST-PES institutional operations.',
			requestingUnit: 'DOST-PES',
			fiscalYear: '2026',
			submittedBy: 'Maria Santos',
			submittedDate: '10 Mar 2026',
			grandTotal: 4200000,
			currentStage: 'Ready for Consolidation',
			status: 'Reviewed',
			workflowStage: 'ready',
			attachedFiles: [],
			justificationPosts: [
				{
					id: 'just-br005-1',
					text: 'FY 2026 PES operations package validated and cleared for unified budget consolidation.',
					postedAt: '2026-03-10T08:00:00.000Z',
					postedBy: 'Maria Santos'
				}
			],
			projects: [
				{
					id: 'proj-pes-1',
					name: 'PES Institutional Operations',
					programName: 'Institutional Support',
					pillarCategory: 'Strengthening and harmonizing DOST system governance',
					description: 'Core institutional operations for DOST-PES.',
					totals: { PS: 2000000, MOOE: 1200000, CO: 1000000, grand: 4200000 },
					physicalMeasures: [],
					lineItems: {
						PS: [{ label: 'Salaries', amount: 2000000, justification: 'Core PES personnel requirements.' }],
						MOOE: [{ label: 'Utility Expenses', amount: 1200000, justification: 'Facility and utility operations.' }],
						CO: [{ label: 'Laboratory equipment', amount: 1000000, justification: 'Equipment refresh for PES laboratories.' }]
					}
				}
			],
			reviewHistory: [
				{
					date: '15 Mar 2026, 9:00 am',
					user: 'Pedro Lim',
					role: 'Finance Officer',
					action: 'Reviewed',
					reason: '-',
					target: 'Entire Request',
					remark: 'Cleared for consolidation.'
				}
			]
		},
		'br-003': {
			referenceNo: 'BR-2027-003',
			title: 'FY 2027 Central Office Modernisation',
			description: 'Enterprise systems upgrade for central office operations.',
			requestingUnit: 'DOST Central Office',
			fiscalYear: '2027',
			submittedBy: 'Elena Torres',
			submittedDate: '25 Jun 2026',
			grandTotal: 9000000,
			currentStage: 'PDO Review',
			status: 'Returned',
			workflowStage: 'pdo',
			returnReason: 'For Revision',
			attachedFiles: [
				{
					id: 'file-br003-1',
					name: 'central-office-scope.pdf',
					size: 184320,
					type: 'application/pdf',
					uploadedAt: '2026-06-24T09:00:00.000Z',
					uploadedBy: 'Elena Torres'
				}
			],
			justificationPosts: [
				{
					id: 'just-br003-1',
					text: 'Central office systems modernisation is required to improve operational efficiency and comply with digital government standards.',
					postedAt: '2026-06-24T08:55:00.000Z',
					postedBy: 'Elena Torres'
				}
			],
			projects: [
				{
					id: 'proj-co-1',
					name: 'Central Office Systems',
					programName: 'Institutional Modernisation',
					pillarCategory: 'Strengthening and harmonizing DOST system governance',
					description: 'Enterprise systems upgrade for central office operations.',
					totals: { PS: 4000000, MOOE: 2000000, CO: 3000000, grand: 9000000 },
					physicalMeasures: [],
					lineItems: {
						PS: [{ label: 'Salaries', amount: 4000000, justification: 'Systems implementation and operations team.' }],
						MOOE: [{ label: 'Professional Services', amount: 2000000, justification: 'Consultancy for enterprise systems rollout.' }],
						CO: [{ label: 'Enterprise servers', amount: 3000000, justification: 'Server infrastructure for central office upgrade.' }]
					}
				}
			],
			reviewHistory: [
				{
					date: '25 Jun 2026, 4:30 pm',
					user: 'Ana Reyes',
					role: 'PDO Reviewer',
					action: 'Returned',
					reason: 'For Revision',
					target: 'Entire Request',
					remark: 'Incomplete physical measures'
				}
			]
		},
		'br-006': {
			referenceNo: 'BR-2026-002',
			title: 'FY 2026 Regional Innovation Grants',
			description: 'Regional innovation grant package supporting technology transfer and startup incubation programs.',
			requestingUnit: 'Region VII',
			fiscalYear: '2026',
			submittedBy: 'Maria Santos',
			submittedDate: '10 Mar 2026',
			grandTotal: 2750000,
			currentStage: 'FO Review',
			status: 'Returned',
			workflowStage: 'fo',
			returnReason: 'For Clarification',
			attachedFiles: [
				{
					id: 'file-br006-1',
					name: 'regional-innovation-brief.pdf',
					size: 215040,
					type: 'application/pdf',
					uploadedAt: '2026-03-10T10:00:00.000Z',
					uploadedBy: 'Maria Santos'
				}
			],
			justificationPosts: [
				{
					id: 'just-br006-1',
					text: 'Regional innovation grants support FY 2026 technology transfer programs aligned with council priorities.',
					postedAt: '2026-03-10T09:55:00.000Z',
					postedBy: 'Maria Santos'
				}
			],
			projects: [
				{
					id: 'proj-reg-1',
					name: 'Startup Incubation Program',
					programName: 'Regional Innovation Program',
					pillarCategory: 'Wealth creation fostered',
					description: 'Incubation support for regional technology startups.',
					totals: { PS: 700000, MOOE: 300000, CO: 500000, grand: 1500000 },
					physicalMeasures: [
						{
							measureId: 'product',
							entries: [
								{ particular: 'Functional Prototype / Proof-of-Concept', quantity: 2, specification: 'Pilot incubation management platform' }
							]
						}
					],
					lineItems: {
						PS: [{ label: 'Salaries', amount: 700000, justification: 'Incubation program coordinators and mentors.' }],
						MOOE: [{ label: 'Training and Scholarship Expenses', amount: 300000, justification: 'Founder training workshops.' }],
						CO: [{ label: 'Incubation facility equipment', amount: 500000, justification: 'Shared lab and co-working equipment.' }]
					}
				},
				{
					id: 'proj-reg-2',
					name: 'Technology Transfer Outreach',
					programName: 'Regional Innovation Program',
					pillarCategory: 'Wealth creation fostered',
					description: 'Outreach activities for technology transfer to regional industry partners.',
					totals: { PS: 500000, MOOE: 250000, CO: 500000, grand: 1250000 },
					physicalMeasures: [],
					lineItems: {
						PS: [{ label: 'Honoraria', amount: 500000, justification: 'Subject matter experts for technology transfer forums.' }],
						MOOE: [{ label: 'Traveling Expenses - Local', amount: 250000, justification: 'Regional outreach and stakeholder meetings.' }],
						CO: [{ label: 'Demonstration equipment', amount: 500000, justification: 'Portable demo kits for field technology transfer.' }]
					}
				}
			],
			reviewHistory: [
				{
					date: '12 Mar 2026, 3:45 pm',
					user: 'Ana Reyes',
					role: 'PDO Reviewer',
					action: 'Reviewed',
					reason: '-',
					target: 'Entire Request',
					remark: 'Forwarded to Finance Officer for review.'
				},
				{
					date: '15 Mar 2026, 11:30 am',
					user: 'Pedro Lim',
					role: 'Finance Officer',
					action: 'Returned',
					reason: 'For Clarification',
					target: 'Attachments & Justification',
					remark: 'Please upload the signed legal opinion and provide additional justification on counterpart funding assumptions.'
				}
			]
		}
	};

	var VERSION_PRESETS = {
		'br-002': [
			{ versionNumber: 1, dateTime: '24 Jun 2026, 9:00 am', userName: 'Maria Santos', userRole: 'Requester', status: 'Pending', currentStage: 'PDO Review', submittedBy: 'Maria Santos', submittedDate: '24 Jun 2026, 9:00 am', remarks: 'Initial submission for PDO review.' },
			{ versionNumber: 2, dateTime: '25 Jun 2026, 3:00 pm', userName: 'Ana Reyes', userRole: 'PDO Reviewer', status: 'Returned', currentStage: 'PDO Review', submittedBy: 'Maria Santos', submittedDate: '24 Jun 2026, 9:00 am', remarks: 'Missing MOOE breakdown.' },
			{ versionNumber: 3, dateTime: '26 Jun 2026, 11:00 am', userName: 'Maria Santos', userRole: 'Requester', status: 'Pending', currentStage: 'PDO Review', submittedBy: 'Maria Santos', submittedDate: '26 Jun 2026, 11:00 am', remarks: 'Resubmitted with budget breakdown.' }
		],
		'br-003': [
			{ versionNumber: 1, dateTime: '24 Jun 2026, 9:00 am', userName: 'Elena Torres', userRole: 'Requester', status: 'Pending', currentStage: 'PDO Review', submittedBy: 'Elena Torres', submittedDate: '24 Jun 2026, 9:00 am', remarks: 'Initial submission for PDO review.' },
			{ versionNumber: 2, dateTime: '25 Jun 2026, 4:30 pm', userName: 'Ana Reyes', userRole: 'PDO Reviewer', status: 'Returned', currentStage: 'PDO Review', submittedBy: 'Elena Torres', submittedDate: '24 Jun 2026, 9:00 am', remarks: 'Incomplete physical measures.' }
		],
		'br-004': [
			{ versionNumber: 1, dateTime: '24 Jun 2026, 8:00 am', userName: 'Juan Dela Cruz', userRole: 'Requester', status: 'Pending', currentStage: 'PDO Review', submittedBy: 'Juan Dela Cruz', submittedDate: '24 Jun 2026, 8:00 am', remarks: 'Submitted for PDO review.' },
			{ versionNumber: 2, dateTime: '25 Jun 2026, 2:15 pm', userName: 'Ana Reyes', userRole: 'PDO Reviewer', status: 'Pending', currentStage: 'FO Review', submittedBy: 'Juan Dela Cruz', submittedDate: '24 Jun 2026, 8:00 am', remarks: 'Validated and forwarded to Finance Officer.' }
		],
		'br-006': [
			{ versionNumber: 1, dateTime: '10 Mar 2026, 10:00 am', userName: 'Maria Santos', userRole: 'Requester', status: 'Pending', currentStage: 'PDO Review', submittedBy: 'Maria Santos', submittedDate: '10 Mar 2026, 10:00 am', remarks: 'Submitted for PDO review.' },
			{ versionNumber: 2, dateTime: '12 Mar 2026, 3:45 pm', userName: 'Ana Reyes', userRole: 'PDO Reviewer', status: 'Pending', currentStage: 'FO Review', submittedBy: 'Maria Santos', submittedDate: '10 Mar 2026, 10:00 am', remarks: 'Validated and forwarded to Finance Officer.' },
			{ versionNumber: 3, dateTime: '15 Mar 2026, 11:30 am', userName: 'Pedro Lim', userRole: 'Finance Officer', status: 'Returned', currentStage: 'FO Review', submittedBy: 'Maria Santos', submittedDate: '10 Mar 2026, 10:00 am', remarks: 'Returned for clarification on supporting documents.' }
		]
	};
