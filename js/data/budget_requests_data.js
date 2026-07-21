/**
*System Name: Budget Management System
*Module Name: budget_requests_data
*
*Purpose of this file:
*Mock budget request list and per-request presets for the BR prototype.
*
*Author: none
*
*Copyright (C) 2026
*by the Department of Science and Technology - Central Office
*
*All rights reserved.
*/

	var REQUESTING_UNIT_PCIEERD = 'Philippine Council for Industry, Energy and Emerging Technology Research and Development';

	var BUDGET_REQUESTS_LIST = [
		{
			id: 'br-001',
			referenceNo: 'BR-2027-001',
			requestingUnit: REQUESTING_UNIT_PCIEERD,
			fiscalYear: '2027',
			projectCount: 2,
			grandTotal: 6550000,
			currentStage: 'Agency Name',
			status: 'Draft',
			lastUpdated: '2026-06-27T08:00:00.000Z',
			isDraft: true
		},
		{
			id: 'br-002',
			referenceNo: 'BR-2027-002',
			requestingUnit: 'DOST-PES',
			fiscalYear: '2027',
			projectCount: 3,
			grandTotal: 500000,
			currentStage: 'PDO Review',
			status: 'Pending',
			lastUpdated: '2026-06-27T10:30:00.000Z',
			isDraft: false
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
			lastUpdated: '2026-06-25T09:00:00.000Z',
			isDraft: false
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
			lastUpdated: '2026-06-26T16:45:00.000Z',
			isDraft: false
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
			lastUpdated: '2026-03-15T08:00:00.000Z',
			isDraft: false
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
			lastUpdated: '2026-06-26T11:30:00.000Z',
			isDraft: false
		}
	];

	/* Expense item categories from LIB Expense Item Categories.xlsx */
	var EXPENSE_ITEM_CATALOG = {
		PS: [
			{ value: 'salaries', label: 'Salaries' },
			{ value: 'honoraria', label: 'Honoraria' }
		],
		MOOE: [
			{ value: 'traveling-local', label: 'Traveling Expenses - Local' },
			{ value: 'traveling-foreign', label: 'Traveling Expenses - Foreign' },
			{ value: 'postage-courier', label: 'Postage and Courier Expenses' },
			{ value: 'telephone-landline', label: 'Telephone Expenses (Landline)' },
			{ value: 'mobile-expenses', label: 'Mobile Expenses' },
			{ value: 'internet-subscription', label: 'Internet Subscription Expenses' },
			{ value: 'cable-satellite-telegraph-radio', label: 'Cable, Satellite, Telegraph and Radio Expenses' },
			{ value: 'rm-office-equipment', label: 'Repairs and Maintenance of Office Equipment' },
			{ value: 'rm-furniture-fixtures', label: 'Repairs and Maintenance of Furnitures and Fixtures' },
			{ value: 'rm-machinery-equipment', label: 'Repairs and Maintenance of Machinery and Equipment' },
			{ value: 'rm-it-equipment-software', label: 'Repairs and Maintenance of IT Equipment and Software' },
			{ value: 'rm-building', label: 'Repairs and Maintenance of Building' },
			{ value: 'rm-office-lab-facilities', label: 'Repairs and Maintenance of Office and Laboratory Facilities' },
			{ value: 'rm-vehicles', label: 'Repairs and Maintenance of Vehicles' },
			{ value: 'supplies-materials', label: 'Supplies and Materials Expenses' },
			{ value: 'utility-expenses', label: 'Utility Expenses' },
			{ value: 'training-scholarship', label: 'Training and Scholarship Expenses' },
			{ value: 'membership-dues', label: 'Membership Dues and Contributions to Organizations (only by Counterpart Funding)' },
			{ value: 'advertising', label: 'Advertising Expenses' },
			{ value: 'printing-publication', label: 'Printing and Publication Expenses' },
			{ value: 'rent', label: 'Rent Expenses' },
			{ value: 'representation', label: 'Representation Expenses' },
			{ value: 'subscription', label: 'Subscription Expenses' },
			{ value: 'survey', label: 'Survey Expenses' },
			{ value: 'professional-services', label: 'Professional Services' },
			{ value: 'taxes-insurance-fees', label: 'Taxes, Insurance Premiums and Other Fees' },
			{ value: 'other-mooe', label: 'Other Maintenance and Operating Expenses' }
		],
		CO: []
	};

	var PILLAR_CATEGORY_OPTIONS = [
	'Human well-being',
	'Wealth creation fostered',
	'Wealth protection reinforced',
	'Sustainability institutionalized',
	'Strengthening and harmonizing DOST system governance'
	];

	var PHYSICAL_MEASURES_CATALOG = [
		{
			id: 'publication',
			title: 'Publication',
			particulars: [
				{
					value: 'intl-peer-reviewed',
					label: 'International Peer-Reviewed Journal Article',
					specificationHint: 'Title of the paper, authors, journal name, volume/issue, and DOI.'
				},
				{
					value: 'national-local-journal',
					label: 'National/Local Journal Article',
					specificationHint: 'Title of the paper, authors, and name of the publishing institution.'
				},
				{
					value: 'conference-proceeding',
					label: 'Conference Proceeding / Abstract',
					specificationHint: 'Title of presentation, name of the conference, location, and date.'
				},
				{
					value: 'book-chapter',
					label: 'Book / Book Chapter',
					specificationHint: 'Title of the book/chapter, editor, publisher, and ISBN.'
				},
				{
					value: 'popular-literature',
					label: 'Popular Literature / Mass Media Feature',
					specificationHint: 'Title of the feature, name of the magazine/newspaper/website, and date published.'
				},
				{
					value: 'technical-report',
					label: 'Technical / Project Report',
					specificationHint: 'Title of the report, funding/receiving agency, and submission date.'
				},
				{
					value: 'manual-handbook',
					label: 'Manual / Handbook / Guideline',
					specificationHint: 'Title of the instructional manual, targeted user group, and circulation scope.'
				},
				{
					value: 'iec-material',
					label: 'Extension / Information, Education, and Communication (IEC) Material',
					specificationHint: 'Type of material (flyer, poster, brochure, infographic), language used, and target audience.'
				},
				{
					value: 'others',
					label: 'Others',
					specificationHint: 'Specify the publication type and required details.'
				}
			]
		},
		{
			id: 'patent-ip',
			title: 'Patent / Intellectual Property',
			particulars: [
				{
					value: 'invention-patent',
					label: 'Invention Patent (Granted/Filed)',
					specificationHint: 'Title of invention, application/registration number, and country of filing.'
				},
				{
					value: 'utility-model',
					label: 'Utility Model (Granted/Filed)',
					specificationHint: 'Title of the utility model, application number, and status.'
				},
				{
					value: 'industrial-design',
					label: 'Industrial Design (Granted/Filed)',
					specificationHint: 'Title of the aesthetic/structural design and registration number.'
				},
				{
					value: 'copyright',
					label: 'Copyright (Registered)',
					specificationHint: 'Title of the software, database, curriculum, or manual, and certificate number.'
				},
				{
					value: 'trademark',
					label: 'Trademark (Registered/Filed)',
					specificationHint: 'Brand name, logo design details, and certificate number.'
				},
				{
					value: 'plant-variety-protection',
					label: 'Plant Variety Protection (PVP)',
					specificationHint: 'Name of the crop strain/variety, certification details, and breeding agency.'
				},
				{
					value: 'trade-secret',
					label: 'Trade Secret Documentation',
					specificationHint: 'Description of the proprietary process/formula and date recorded by the institution.'
				},
				{
					value: 'others',
					label: 'Others',
					specificationHint: 'Specify the intellectual property type and required details.'
				}
			]
		},
		{
			id: 'product',
			title: 'Product',
			particulars: [
				{
					value: 'functional-prototype',
					label: 'Functional Prototype / Hardware',
					specificationHint: 'Name of the machine/device, core technical specifications, and current TRL (Technology Readiness Level).'
				},
				{
					value: 'bio-chemical-formulation',
					label: 'Biological / Chemical Formulation',
					specificationHint: 'Name of the substance (e.g., biofertilizer, ointment, extract), active ingredients, and intended application.'
				},
				{
					value: 'software-app',
					label: 'Software Application / Digital Platform',
					specificationHint: 'Name of the software/app, target operating system/environment, and core functionality.'
				},
				{
					value: 'consumer-good',
					label: 'Consumer Good / Fortified Food Item',
					specificationHint: 'Name of the product, ingredients/materials used, and target consumer market.'
				},
				{
					value: 'diagnostic-kit',
					label: 'Diagnostic / Testing Kit',
					specificationHint: 'Name of the kit, what virus/substance it detects, and sensitivity/accuracy rates.'
				},
				{
					value: 'others',
					label: 'Others',
					specificationHint: 'Specify the product type and required details.'
				}
			]
		},
		{
			id: 'people-service',
			title: 'People Service',
			particulars: [
				{
					value: 'training-workshop',
					label: 'Specialized Training / Capability-Building Workshop',
					specificationHint: 'Title of the training, duration, modules covered, and total number of participants trained.'
				},
				{
					value: 'graduate-mentorship',
					label: 'Degree-Granting Graduate Mentorship (MS/PhD)',
					specificationHint: 'Number of scholars supported, their degree programs, and thesis titles.'
				},
				{
					value: 'undergraduate-internship',
					label: 'Undergraduate Internship / Technical Apprenticeship',
					specificationHint: 'Number of student interns onboarded, lab/field skills transferred, and total hours served.'
				},
				{
					value: 'technical-seminar',
					label: 'Technical Seminar / Knowledge-Sharing Session',
					specificationHint: 'Topic of the seminar, target audience (e.g., academe, industry, public), and attendee count.'
				},
				{
					value: 'community-skills-transfer',
					label: 'Community / Cooperative Skills Transfer',
					specificationHint: 'Name of the adopting group, specific technology/process taught, and adoption date.'
				},
				{
					value: 'others',
					label: 'Others',
					specificationHint: 'Specify the people service type and required details.'
				}
			]
		},
		{
			id: 'place-partnership',
			title: 'Place and Partnership',
			particulars: [
				{
					value: 'moa-mou',
					label: 'Institutional Linkage / Academic-Industry Agreement (MOA/MOU)',
					specificationHint: 'Name of the partner institution/firm, scope of collaboration, and date signed.'
				},
				{
					value: 'public-private-consortium',
					label: 'Public-Private Consortium',
					specificationHint: 'Name of the coalition/network formed, participating organizations, and shared funding/project goals.'
				},
				{
					value: 'research-station',
					label: 'Dedicated Research Station / Field Facility',
					specificationHint: 'Geographic location, size/type of facility, and host community.'
				},
				{
					value: 'tech-transfer-licensing',
					label: 'Tech-Transfer / Licensing Agreement',
					specificationHint: 'Name of the adopting private company/spin-off and scope of the commercial license.'
				},
				{
					value: 'others',
					label: 'Others',
					specificationHint: 'Specify the place/partnership type and required details.'
				}
			]
		},
		{
			id: 'policy',
			title: 'Policy',
			particulars: [
				{
					value: 'legislation-policy-brief',
					label: 'Legislation / Congressional Policy Brief',
					specificationHint: 'Title of the policy brief, name of the legislative committee, and House/Senate Bill referenced.'
				},
				{
					value: 'executive-order',
					label: 'Executive / Administrative Order (National Level)',
					specificationHint: 'Name of the National Government Agency (NGA), title of the draft order, and regulatory scope.'
				},
				{
					value: 'local-ordinance',
					label: 'Local Ordinance / Resolution (LGU Level)',
					specificationHint: 'Local government unit name (City/Province/Barangay), ordinance number, and date passed.'
				},
				{
					value: 'institutional-sop',
					label: 'Institutional / Academic Policy or Standard Operating Procedure (SOP)',
					specificationHint: 'Name of the university/organization, title of the policy/SOP, and target implementation unit.'
				},
				{
					value: 'others',
					label: 'Others',
					specificationHint: 'Specify the policy type and required details.'
				}
			]
		},
		{
			id: 'social-impact',
			title: 'Social Impact',
			particulars: [
				{
					value: 'community-organization',
					label: 'Community-Based Organization / Cooperative Formation',
					specificationHint: 'Name of the local group organized, member demographics, and organizational goals.'
				},
				{
					value: 'dispute-resolution',
					label: 'Dispute Resolution / Resource Management Improvement',
					specificationHint: 'Nature of the community issue resolved and data/methodology used to fix it.'
				},
				{
					value: 'public-health',
					label: 'Public Health / Well-being Indicator Improvement',
					specificationHint: 'Nature of the improvement (e.g., reduction in local illness, cleaner water metrics) and baseline vs. current data.'
				},
				{
					value: 'cultural-heritage',
					label: 'Cultural Heritage / Local Practice Revitalization',
					specificationHint: 'Name of the indigenous or traditional practice preserved/upgraded and the target community.'
				},
				{
					value: 'others',
					label: 'Others',
					specificationHint: 'Specify the social impact type and required details.'
				}
			]
		},
		{
			id: 'economic-impact',
			title: 'Economic Impact',
			particulars: [
				{
					value: 'cost-reduction',
					label: 'Production / Operational Cost Reduction',
					specificationHint: 'Percentage or monetary value of costs saved by adopting enterprises and baseline comparison.'
				},
				{
					value: 'job-creation',
					label: 'Job Creation / Employment Generation',
					specificationHint: 'Number of full-time/part-time jobs generated and the local industry/location benefited.'
				},
				{
					value: 'spin-off-startup',
					label: 'Institutional Spin-off / Startup Company Launch',
					specificationHint: 'Name of the newly registered business entity and its commercial sector.'
				},
				{
					value: 'import-substitution',
					label: 'Resource Import Substitution / Local Sourcing',
					specificationHint: 'Name of the imported material replaced and estimated foreign exchange/import savings.'
				},
				{
					value: 'income-increase',
					label: 'Household / Cooperative Income Increase',
					specificationHint: 'Percentage or average monetary increase in monthly net income for the targeted beneficiaries.'
				},
				{
					value: 'others',
					label: 'Others',
					specificationHint: 'Specify the economic impact type and required details.'
				}
			]
		}
	];

	var REQUEST_ATTACHMENTS = {
		'br-002': {
			attachedFiles: [
				{
					id: 'file-br002-1',
					name: 'ict-lab-supporting-memo.pdf',
					size: 312320,
					type: 'application/pdf',
					uploadedAt: '2026-06-27T08:30:00.000Z',
					uploadedBy: 'Maria Santos'
				}
			],
			justificationPosts: [
				{
					id: 'just-br002-1',
					text: 'Integrated ICT and laboratory upgrades are required to sustain DOST-PES research operations and comply with digital government service standards.',
					postedAt: '2026-06-27T08:25:00.000Z',
					postedBy: 'Maria Santos'
				}
			]
		},
		'br-003': {
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
			]
		},
		'br-006': {
			attachedFiles: [
				{
					id: 'file-br006-1',
					name: 'regional-innovation-brief.pdf',
					size: 215040,
					type: 'application/pdf',
					uploadedAt: '2026-06-23T10:00:00.000Z',
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
			]
		}
	};

	var REQUEST_REVIEW_HISTORY = {
		'br-003': [
			{
				date: '25 Jun 2026, 4:30 pm',
				user: 'Ana Reyes',
				role: 'PDO Reviewer',
				action: 'Returned',
				reason: 'For Revision',
				target: 'Entire Request',
				remark: 'Incomplete physical measures'
			}
		],
		'br-006': [
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
	};

	var REQUEST_RETURN_REASON = {
		'br-003': 'For Revision',
		'br-006': 'For Clarification'
	};

	var REQUEST_WORKFLOW_STAGE = {
		'br-002': 'pdo',
		'br-003': 'pdo',
		'br-004': 'fo',
		'br-005': 'ready',
		'br-006': 'fo'
	};

	var REQUEST_FORM_PRESETS = {
		'br-002': {
			title: 'FY 2027 ICT and Lab Modernisation',
			description: 'Integrated ICT upgrade and laboratory modernisation for DOST-PES research operations.',
			fiscalYear: '2027',
			requestingUnit: 'DOST-PES'
		},
		'br-003': {
			title: 'FY 2027 Central Office Modernisation',
			description: 'Enterprise systems and infrastructure upgrade for central office operations.',
			fiscalYear: '2027',
			requestingUnit: 'DOST Central Office'
		},
		'br-004': {
			title: 'FY 2027 Regional Innovation Program',
			description: 'Regional innovation hub and technology transfer package for Region VII.',
			fiscalYear: '2027',
			requestingUnit: 'Region VII'
		},
		'br-005': {
			title: 'FY 2026 PES Operations Package',
			description: 'Validated FY 2026 budget package for DOST-PES institutional operations.',
			fiscalYear: '2026',
			requestingUnit: 'DOST-PES'
		},
		'br-006': {
			title: 'FY 2026 Regional Innovation Grants',
			description: 'Regional innovation grant package supporting technology transfer and startup incubation programs.',
			fiscalYear: '2026',
			requestingUnit: 'Region VII'
		}
	};

	var REQUEST_VERSIONS = {
		'br-002': [
			{
				versionNumber: 1,
				dateTime: '24 Jun 2026, 9:00 am',
				userName: 'Maria Santos',
				userRole: 'Agency Name',
				status: 'Pending',
				currentStage: 'PDO Review',
				remarks: 'Initial submission for PDO review.',
				snapshot: {
					general: {
						referenceNo: 'BR-2027-002',
						title: 'FY 2027 ICT and Lab Modernisation',
						description: 'Integrated ICT upgrade and laboratory modernisation for DOST-PES research operations.',
						submittedBy: 'Maria Santos',
						submittedDate: '24 Jun 2026, 9:00 am',
						status: 'Pending',
						currentStage: 'PDO Review'
					},
					projects: [],
					totals: { PS: 200000, MOOE: 120000, CO: 180000, grand: 500000 }
				}
			},
			{
				versionNumber: 2,
				dateTime: '25 Jun 2026, 3:00 pm',
				userName: 'Ana Reyes',
				userRole: 'PDO Reviewer',
				status: 'Returned',
				currentStage: 'PDO Review',
				remarks: 'Missing MOOE breakdown.',
				snapshot: {
					general: {
						referenceNo: 'BR-2027-002',
						title: 'FY 2027 ICT and Lab Modernisation',
						description: 'Integrated ICT upgrade and laboratory modernisation for DOST-PES research operations.',
						submittedBy: 'Maria Santos',
						submittedDate: '24 Jun 2026, 9:00 am',
						status: 'Returned',
						currentStage: 'PDO Review'
					},
					projects: [],
					totals: { PS: 200000, MOOE: 120000, CO: 180000, grand: 500000 }
				}
			},
			{
				versionNumber: 3,
				dateTime: '26 Jun 2026, 11:00 am',
				userName: 'Maria Santos',
				userRole: 'Agency Name',
				status: 'Pending',
				currentStage: 'PDO Review',
				remarks: 'Resubmitted with budget breakdown.',
				snapshot: {
					general: {
						referenceNo: 'BR-2027-002',
						title: 'FY 2027 ICT and Lab Modernisation',
						description: 'Integrated ICT upgrade and laboratory modernisation for DOST-PES research operations.',
						submittedBy: 'Maria Santos',
						submittedDate: '26 Jun 2026, 11:00 am',
						status: 'Pending',
						currentStage: 'PDO Review'
					},
					projects: [],
					totals: { PS: 200000, MOOE: 120000, CO: 180000, grand: 500000 }
				}
			}
		],
		'br-003': [
			{
				versionNumber: 1,
				dateTime: '24 Jun 2026, 9:00 am',
				userName: 'Elena Torres',
				userRole: 'Agency Name',
				status: 'Pending',
				currentStage: 'PDO Review',
				remarks: 'Initial submission for PDO review.',
				snapshot: {
					general: {
						referenceNo: 'BR-2027-003',
						title: 'FY 2027 Central Office Modernisation',
						description: 'Enterprise systems and infrastructure upgrade for central office operations.',
						submittedBy: 'Elena Torres',
						submittedDate: '24 Jun 2026, 9:00 am',
						status: 'Pending',
						currentStage: 'PDO Review'
					},
					projects: [],
					totals: { PS: 4000000, MOOE: 2000000, CO: 3000000, grand: 9000000 }
				}
			},
			{
				versionNumber: 2,
				dateTime: '25 Jun 2026, 4:30 pm',
				userName: 'Ana Reyes',
				userRole: 'PDO Reviewer',
				status: 'Returned',
				currentStage: 'PDO Review',
				remarks: 'Incomplete physical measures.',
				snapshot: {
					general: {
						referenceNo: 'BR-2027-003',
						title: 'FY 2027 Central Office Modernisation',
						description: 'Enterprise systems and infrastructure upgrade for central office operations.',
						submittedBy: 'Elena Torres',
						submittedDate: '24 Jun 2026, 9:00 am',
						status: 'Returned',
						currentStage: 'PDO Review'
					},
					projects: [],
					totals: { PS: 4000000, MOOE: 2000000, CO: 3000000, grand: 9000000 }
				}
			}
		],
		'br-006': [
			{
				versionNumber: 1,
				dateTime: '10 Mar 2026, 10:00 am',
				userName: 'Maria Santos',
				userRole: 'Agency Name',
				status: 'Pending',
				currentStage: 'PDO Review',
				remarks: 'Submitted for PDO review.',
				snapshot: {
					general: {
						referenceNo: 'BR-2026-002',
						title: 'FY 2026 Regional Innovation Grants',
						description: 'Regional innovation grant package supporting technology transfer and startup incubation programs.',
						submittedBy: 'Maria Santos',
						submittedDate: '10 Mar 2026, 10:00 am',
						status: 'Pending',
						currentStage: 'PDO Review'
					},
					projects: [],
					totals: { PS: 1200000, MOOE: 550000, CO: 1000000, grand: 2750000 }
				}
			},
			{
				versionNumber: 2,
				dateTime: '12 Mar 2026, 3:45 pm',
				userName: 'Ana Reyes',
				userRole: 'PDO Reviewer',
				status: 'Pending',
				currentStage: 'FO Review',
				remarks: 'Validated and forwarded to Finance Officer.',
				snapshot: {
					general: {
						referenceNo: 'BR-2026-002',
						title: 'FY 2026 Regional Innovation Grants',
						description: 'Regional innovation grant package supporting technology transfer and startup incubation programs.',
						submittedBy: 'Maria Santos',
						submittedDate: '10 Mar 2026, 10:00 am',
						status: 'Pending',
						currentStage: 'FO Review'
					},
					projects: [],
					totals: { PS: 1200000, MOOE: 550000, CO: 1000000, grand: 2750000 }
				}
			},
			{
				versionNumber: 3,
				dateTime: '15 Mar 2026, 11:30 am',
				userName: 'Pedro Lim',
				userRole: 'Finance Officer',
				status: 'Returned',
				currentStage: 'FO Review',
				remarks: 'Returned for clarification on supporting documents.',
				snapshot: {
					general: {
						referenceNo: 'BR-2026-002',
						title: 'FY 2026 Regional Innovation Grants',
						description: 'Regional innovation grant package supporting technology transfer and startup incubation programs.',
						submittedBy: 'Maria Santos',
						submittedDate: '10 Mar 2026, 10:00 am',
						status: 'Returned',
						currentStage: 'FO Review'
					},
					projects: [],
					totals: { PS: 1200000, MOOE: 550000, CO: 1000000, grand: 2750000 }
				}
			}
		]
	};
