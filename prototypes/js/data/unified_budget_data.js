/**
*System Name: Budget Management System
*Module Name: unified_budget_data
*
*Purpose of this file:
*Eligible budget requests for unified budget consolidation (prototype mock).
*
*Author: none
*
*Copyright (C) 2026
*by the Department of Science and Technology - Central Office
*
*All rights reserved.
*/

	var ELIGIBLE_BUDGET_REQUESTS = [
	{
		id: 'br-el-1',
		referenceNo: 'BR-2027-101',
		title: 'PAGASA Weather Modernization FY 2027',
		fiscalYear: '2027',
		requestingUnit: 'PAGASA',
		agencyCategory: 'RDAs',
		lines: [
			{ pillar: 'Human well-being', allotment: 'PS', amount: 1200000 },
			{ pillar: 'Human well-being', allotment: 'MOOE', amount: 450000 },
			{ pillar: 'Wealth creation fostered', allotment: 'CO', amount: 1800000 }
		]
	},
	{
		id: 'br-el-2',
		referenceNo: 'BR-2027-102',
		title: 'FNRI Nutrition Research Program FY 2027',
		fiscalYear: '2027',
		requestingUnit: 'FNRI',
		agencyCategory: 'RDAs',
		lines: [
			{ pillar: 'Human well-being', allotment: 'PS', amount: 800000 },
			{ pillar: 'Human well-being', allotment: 'MOOE', amount: 350000 },
			{ pillar: 'Wealth creation fostered', allotment: 'CO', amount: 950000 }
		]
	},
	{
		id: 'br-el-3',
		referenceNo: 'BR-2027-103',
		title: 'PCAARRD Agriculture R&D FY 2027',
		fiscalYear: '2027',
		requestingUnit: 'PCAARRD',
		agencyCategory: 'Sectoral Councils',
		lines: [
			{ pillar: 'Wealth creation fostered', allotment: 'PS', amount: 1100000 },
			{ pillar: 'Wealth creation fostered', allotment: 'MOOE', amount: 600000 },
			{ pillar: 'Wealth creation fostered', allotment: 'CO', amount: 1100000 }
		]
	},
	{
		id: 'br-el-4',
		referenceNo: 'BR-2027-104',
		title: 'NRCP Basic Research Grants FY 2027',
		fiscalYear: '2027',
		requestingUnit: 'NRCP',
		agencyCategory: 'Sectoral Councils',
		lines: [
			{ pillar: 'Wealth creation fostered', allotment: 'PS', amount: 1500000 },
			{ pillar: 'Human well-being', allotment: 'MOOE', amount: 750000 },
			{ pillar: 'Wealth creation fostered', allotment: 'CO', amount: 1900000 }
		]
	}
	];
