/**
*System Name: Budget Management System
*Module Name: dashboard_data
*
*Purpose of this file:
*Mock data for the Financial Dashboard prototype (planning and monitoring tabs).
*
*Author: none
*
*Copyright (C) 2026
*by the Department of Science and Technology - Central Office
*
*All rights reserved.
*/

var sampleDashboardFilters = {
	fiscalYears: [
		{ value: 'fy-2027', label: 'FY 2027' },
		{ value: 'fy-2026', label: 'FY 2026' },
		{ value: 'fy-2025', label: 'FY 2025' }
	],
	/* Pillars: 5 fixed values (same list as budget request projects) */
	pillars: [
		{ value: 'human-well-being', label: 'Human well-being' },
		{ value: 'wealth-creation-fostered', label: 'Wealth creation fostered' },
		{ value: 'wealth-protection-reinforced', label: 'Wealth protection reinforced' },
		{ value: 'sustainability-institutionalized', label: 'Sustainability institutionalized' },
		{ value: 'dost-system-governance', label: 'Strengthening and harmonizing DOST system governance' }
	],
	/* Allotment cases: 3 fixed values, full names */
	allotmentCases: [
		{ value: 'personnel-services', label: 'Personnel Services' },
		{ value: 'maintenance-and-other-operating-expenses', label: 'Maintenance and Other Operating Expenses' },
		{ value: 'capital-outlay', label: 'Capital Outlay' }
	],
	/* Agency categories and names from Agency List.xlsx (BMS Reference Documents) */
	agencyCategories: [
		{ value: 'dost-osec', label: 'DOST OSEC' },
		{ value: 'dost-regional-offices', label: 'DOST Regional Offices' },
		{ value: 'rnd-institutes', label: 'R&D Institutes' },
		{ value: 'sectoral-councils', label: 'Sectoral Councils' },
		{ value: 'st-services', label: 'S&T Services' },
		{ value: 'advisory-councils', label: 'Advisory Councils' }
	],
	agencyNames: [
		{ value: 'central-office', label: 'Central Office', category: 'dost-osec' },
		{ value: 'ncr', label: 'NCR - National Capital Region', category: 'dost-regional-offices' },
		{ value: 'car', label: 'CAR - Cordillera Administrative Region', category: 'dost-regional-offices' },
		{ value: 'region-1', label: 'DOST Region I (Ilocos Region)', category: 'dost-regional-offices' },
		{ value: 'region-2', label: 'DOST Region II (Cagayan Valley)', category: 'dost-regional-offices' },
		{ value: 'region-3', label: 'DOST Region III (Central Luzon)', category: 'dost-regional-offices' },
		{ value: 'region-4a', label: 'DOST Region IV-A (CALABARZON)', category: 'dost-regional-offices' },
		{ value: 'region-4b', label: 'DOST Region IV-B (MIMAROPA)', category: 'dost-regional-offices' },
		{ value: 'region-5', label: 'DOST Region V (Bicol Region)', category: 'dost-regional-offices' },
		{ value: 'region-6', label: 'DOST Region VI (Western Visayas)', category: 'dost-regional-offices' },
		{ value: 'region-7', label: 'DOST Region VII (Central Visayas)', category: 'dost-regional-offices' },
		{ value: 'region-8', label: 'DOST Region VIII (Eastern Visayas)', category: 'dost-regional-offices' },
		{ value: 'region-9', label: 'DOST Region IX (Zamboanga Peninsula)', category: 'dost-regional-offices' },
		{ value: 'region-10', label: 'DOST Region X (Northern Mindanao)', category: 'dost-regional-offices' },
		{ value: 'region-11', label: 'DOST Region XI (Davao Region)', category: 'dost-regional-offices' },
		{ value: 'region-12', label: 'DOST Region XII (SOCCSKSARGEN)', category: 'dost-regional-offices' },
		{ value: 'caraga', label: 'CARAGA - Region XIII (Caraga)', category: 'dost-regional-offices' },
		{ value: 'asti', label: 'ASTI - Advanced Science and Technology Institute', category: 'rnd-institutes' },
		{ value: 'fnri', label: 'FNRI - Food and Nutrition Research Institute', category: 'rnd-institutes' },
		{ value: 'fprdi', label: 'FPRDI - Forest Products Research and Development Institute', category: 'rnd-institutes' },
		{ value: 'itdi', label: 'ITDI - Industrial Technology Development Institute', category: 'rnd-institutes' },
		{ value: 'mirdc', label: 'MIRDC - Metals Industry Research and Development Center', category: 'rnd-institutes' },
		{ value: 'pnri', label: 'PNRI - Philippine Nuclear Research Institute', category: 'rnd-institutes' },
		{ value: 'ptri', label: 'PTRI - Philippine Textile Research Institute', category: 'rnd-institutes' },
		{ value: 'pcaarrd', label: 'PCAARRD - Philippine Council for Agriculture, Aquatic and Natural Resources Research and Development', category: 'sectoral-councils' },
		{ value: 'pchrd', label: 'PCHRD - Philippine Council for Health Research and Development', category: 'sectoral-councils' },
		{ value: 'pcieerd', label: 'PCIEERD - Philippine Council for Industry, Energy and Emerging Technology Research and Development', category: 'sectoral-councils' },
		{ value: 'pagasa', label: 'PAGASA - Philippine Atmospheric, Geophysical and Astronomical Services Administration', category: 'st-services' },
		{ value: 'phivolcs', label: 'PHIVOLCS - Philippine Institute of Volcanology and Seismology', category: 'st-services' },
		{ value: 'pshss', label: 'PSHSS - Philippine Science High School System', category: 'st-services' },
		{ value: 'sei', label: 'SEI - Science Education Institute', category: 'st-services' },
		{ value: 'stii', label: 'STII - Science and Technology Information Institute', category: 'st-services' },
		{ value: 'tapi', label: 'TAPI - Technology Application and Promotion Institute', category: 'st-services' },
		{ value: 'nast', label: 'NAST - National Academy of Science and Technology', category: 'advisory-councils' },
		{ value: 'nrcp', label: 'NRCP - National Research Council of the Philippines', category: 'advisory-councils' }
	],
	statuses: [
		{ value: 'draft', label: 'Draft' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'returned', label: 'Returned' },
		{ value: 'reviewed', label: 'Reviewed' },
		{ value: 'consolidated', label: 'Consolidated' }
	],
	budgetStatuses: [
		{ value: 'all', label: 'All' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'returned', label: 'Returned' },
		{ value: 'reviewed', label: 'Reviewed' },
		{ value: 'consolidated', label: 'Consolidated' }
	]
};

var sampleDashboardPlanning = {
	budgetByPillar: {
		labels: [
			'Human well-being',
			'Wealth creation fostered',
			'Wealth protection reinforced',
			'Sustainability institutionalized',
			'Strengthening and harmonizing DOST system governance'
		],
		/* Short axis labels; full names stay in the tooltip */
		labelsShort: [
			'Human well-being',
			'Wealth creation',
			'Wealth protection',
			'Sustainability',
			'DOST governance'
		],
		budgetRequests: [
			{ label: 'Personnel Services', data: [4200000, 5100000, 3200000, 2800000, 3200000] },
			{ label: 'Maintenance and Other Operating Expenses', data: [5600000, 6800000, 4100000, 3500000, 4200000] },
			{ label: 'Capital Outlay', data: [2900000, 3600000, 2100000, 1800000, 2400000] }
		],
		unifiedBudget: [
			{ label: 'Personnel Services', data: [3800000, 4600000, 2800000, 2400000, 2600000] },
			{ label: 'Maintenance and Other Operating Expenses', data: [5000000, 6100000, 3600000, 3000000, 4100000] },
			{ label: 'Capital Outlay', data: [2500000, 3100000, 1700000, 1400000, 1800000] }
		]
	},
	/* Agency-level planning summary; total = ps + mooe + co */
	planningSummaryRows: [
		{ agencyName: 'DOST-PES', pillarCnt: 3, projectCnt: 5, ps: 2500000, mooe: 3100000, co: 1200000 },
		{ agencyName: 'DOST Region VII', pillarCnt: 2, projectCnt: 4, ps: 1800000, mooe: 2700000, co: 900000 },
		{ agencyName: 'Central Office', pillarCnt: 4, projectCnt: 6, ps: 3200000, mooe: 4100000, co: 2000000 },
		{ agencyName: 'ASTI - Advanced Science and Technology Institute', pillarCnt: 2, projectCnt: 3, ps: 1400000, mooe: 2200000, co: 800000 },
		{ agencyName: 'PAGASA', pillarCnt: 3, projectCnt: 4, ps: 1700000, mooe: 2500000, co: 1100000 }
	]
};

/* Physical Plans & Accomplishments tab (US38) - mock data only */
var sampleDashboardPhysical = {
	physicalMeasures: [
		{ value: 'publication', label: 'Publication' },
		{ value: 'product', label: 'Product' },
		{ value: 'people-service', label: 'People Service' },
		{ value: 'place-partnership', label: 'Place and Partnership' },
		{ value: 'policy', label: 'Policy' },
		{ value: 'social-impact', label: 'Social Impact' },
		{ value: 'economic-impact', label: 'Economic Impact' },
		{ value: 'patent-ip', label: 'Patent / IP' }
	],
	kpiCards: [
		{ key: 'plannedProjects', label: 'Planned Projects', value: '36', subtitle: 'Filtered Result' },
		{ key: 'plannedQuantity', label: 'Planned Quantity', value: '248', subtitle: 'Filtered Result' },
		{ key: 'accomplishedQuantity', label: 'Accomplished Quantity', value: '174', subtitle: 'Filtered Result' },
		{ key: 'achievementRate', label: 'Achievement Rate', value: '70.2%', subtitle: 'Accomplished / Planned' }
	],
	projectsByPillar: {
		labels: [
			'Human well-being',
			'Wealth creation fostered',
			'Sustainability institutionalized',
			'Wealth protection reinforced',
			'Strengthening DOST governance'
		],
		values: [12, 9, 6, 5, 4]
	},
	plannedByMeasure: {
		labels: ['Publication', 'Product', 'People Service', 'Place and Partnership', 'Policy', 'Social Impact', 'Economic Impact', 'Patent / IP'],
		values: [60, 48, 45, 30, 25, 22, 12, 6]
	},
	particularBreakdown: {
		'publication': {
			labels: ['International Peer-Reviewed Journal Article', 'Technical / Project Report', 'Conference Proceeding / Abstract', 'Manual / Handbook / Guideline', 'Others'],
			values: [20, 15, 10, 8, 7]
		},
		'product': {
			labels: ['Software Application', 'Prototype / Equipment', 'New Process / Method', 'Improved Variety / Breed', 'Others'],
			values: [16, 12, 10, 6, 4]
		},
		'people-service': {
			labels: ['Trainees / Scholars Supported', 'Technical Advisory Services', 'Communities Served', 'Others'],
			values: [22, 12, 8, 3]
		},
		'place-partnership': {
			labels: ['MOA / MOU', 'Facility Established / Upgraded', 'Network / Consortium', 'Others'],
			values: [14, 8, 5, 3]
		},
		'policy': {
			labels: ['Congressional Policy Brief', 'Agency Policy Adopted', 'Policy Recommendation Submitted', 'Others'],
			values: [10, 7, 5, 3]
		},
		'social-impact': {
			labels: ['Community-based Organisation', 'Livelihood Programme Assisted', 'Others'],
			values: [11, 7, 4]
		},
		'economic-impact': {
			labels: ['Enterprise Assisted', 'Jobs Generated', 'Others'],
			values: [6, 4, 2]
		},
		'patent-ip': {
			labels: ['Patent Application Filed', 'Utility Model Registered', 'Others'],
			values: [3, 2, 1]
		}
	},
	plannedVsAccomplished: {
		labels: ['Publication', 'Product', 'People Service', 'Place and Partnership', 'Policy', 'Social Impact', 'Economic Impact', 'Patent / IP'],
		planned: [60, 48, 45, 30, 25, 22, 12, 6],
		accomplished: [42, 40, 30, 18, 10, 14, 8, 2]
	},
	achievementRateByPillar: {
		labels: [
			'Human well-being',
			'Wealth creation fostered',
			'Strengthening DOST governance',
			'Wealth protection reinforced',
			'Sustainability institutionalized'
		],
		values: [82, 74, 71, 65, 58]
	},
	projectRows: [
		{ project: 'ICT Upgrade Platform', agencyName: 'DOST-PES', pillar: 'Wealth creation fostered', physicalMeasure: 'Product', particular: 'Software Application', plannedQty: 1, accomplishedQty: 1, variance: 0, achievementRate: 100, lastUpdated: '28 Jun 2026' },
		{ project: 'Lab Modernisation', agencyName: 'DOST Region VII', pillar: 'Human well-being', physicalMeasure: 'Publication', particular: 'Technical / Project Report', plannedQty: 3, accomplishedQty: 2, variance: -1, achievementRate: 67, lastUpdated: '26 Jun 2026' },
		{ project: 'Policy Support Initiative', agencyName: 'Central Office', pillar: 'Strengthening DOST governance', physicalMeasure: 'Policy', particular: 'Congressional Policy Brief', plannedQty: 2, accomplishedQty: 0, variance: -2, achievementRate: 0, lastUpdated: '' },
		{ project: 'Community Innovation Program', agencyName: 'DOST Region X', pillar: 'Sustainability institutionalized', physicalMeasure: 'Social Impact', particular: 'Community-based Organisation', plannedQty: 4, accomplishedQty: 1, variance: -3, achievementRate: 25, lastUpdated: '21 Jun 2026' },
		{ project: 'Energy Tech Transfer', agencyName: 'DOST-PES', pillar: 'Wealth creation fostered', physicalMeasure: 'Place and Partnership', particular: 'MOA / MOU', plannedQty: 5, accomplishedQty: 3, variance: -2, achievementRate: 60, lastUpdated: '24 Jun 2026' }
	]
};

var sampleDashboardMonitoring = {
	summaryCards: [
		{ key: 'appropriation', label: 'Appropriation', value: 53600000 },
		{ key: 'allotment', label: 'Allotment', value: 48200000 },
		{ key: 'obligation', label: 'Obligation', value: 41500000 },
		{ key: 'disbursement', label: 'Disbursement', value: 36800000 }
	],
	trend: [
		{ year: '2022', appropriation: 41000000, allotment: 38000000, obligation: 33500000, disbursement: 30200000 },
		{ year: '2023', appropriation: 39800000, allotment: 37100000, obligation: 34200000, disbursement: 28900000 },
		{ year: '2024', appropriation: 48700000, allotment: 42600000, obligation: 39100000, disbursement: 35200000 },
		{ year: '2025', appropriation: 46900000, allotment: 44800000, obligation: 37800000, disbursement: 33700000 },
		{ year: '2026', appropriation: 53600000, allotment: 48200000, obligation: 41500000, disbursement: 36800000 }
	],
	/* Variance per pillar, stacked by allotment case (same 5 pillars as planning) */
	releasedVariance: [
		{ label: 'Personnel Services', data: [420000, 380000, 250000, 200000, 154000] },
		{ label: 'Maintenance and Other Operating Expenses', data: [520000, 460000, 340000, 280000, 236000] },
		{ label: 'Capital Outlay', data: [320000, 290000, 210000, 170000, 144000] }
	],
	executionVariance: [
		{ label: 'Personnel Services', data: [480000, 420000, 320000, 250000, 205000] },
		{ label: 'Maintenance and Other Operating Expenses', data: [660000, 590000, 440000, 360000, 295000] },
		{ label: 'Capital Outlay', data: [420000, 370000, 280000, 230000, 174000] }
	],
	performanceRows: [
		{ agencyName: 'Central Office', appropriation: 12400000, allotment: 11600000, obligation: 10900000, disbursement: 10200000, executionRate: 93.97, disbursementRate: 93.58, absorptionRate: 87.93 },
		{ agencyName: 'ASTI - Advanced Science and Technology Institute', appropriation: 9800000, allotment: 9100000, obligation: 8000000, disbursement: 7100000, executionRate: 87.91, disbursementRate: 88.75, absorptionRate: 78.02 },
		{ agencyName: 'PCIEERD - Philippine Council for Industry, Energy and Emerging Technology Research and Development', appropriation: 11200000, allotment: 10100000, obligation: 8600000, disbursement: 7300000, executionRate: 85.15, disbursementRate: 84.88, absorptionRate: 72.28 },
		{ agencyName: 'DOST Region VII (Central Visayas)', appropriation: 8600000, allotment: 7700000, obligation: 6200000, disbursement: 5000000, executionRate: 80.52, disbursementRate: 80.65, absorptionRate: 64.94 },
		{ agencyName: 'PAGASA - Philippine Atmospheric, Geophysical and Astronomical Services Administration', appropriation: 7200000, allotment: 6100000, obligation: 4400000, disbursement: 3300000, executionRate: 72.13, disbursementRate: 75.00, absorptionRate: 54.10 },
		{ agencyName: 'NRCP - National Research Council of the Philippines', appropriation: 4400000, allotment: 3600000, obligation: 3400000, disbursement: 3200000, executionRate: 94.44, disbursementRate: 94.12, absorptionRate: 88.89 }
	]
};
