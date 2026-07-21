/**
*System Name: Budget Management System
*Module Name: users_data
*
*Purpose of this file:
*Mock user groups, roles, agencies, and user accounts for System Config.
*
*Author: none
*
*Copyright (C) 2026
*by the Department of Science and Technology - Central Office
*
*All rights reserved.
*/

	var USER_GROUPS = [
		{ id: 'system_user', label: 'System User' },
		{ id: 'executive', label: 'Executive' },
		{ id: 'system_administrator', label: 'System Administrator' }
	];

	var USER_ROLES = [
		{ id: 'requester', label: 'Requester', groupId: 'system_user', requiresAgency: true },
		{ id: 'project_development_officer', label: 'Project Development Officer', groupId: 'system_user', requiresAgency: false },
		{ id: 'finance_officer', label: 'Finance Officer', groupId: 'system_user', requiresAgency: false },
		{ id: 'planning_director', label: 'Planning Director', groupId: 'executive', requiresAgency: false },
		{ id: 'finance_director', label: 'Finance Director', groupId: 'executive', requiresAgency: false },
		{ id: 'usec', label: 'USEC', groupId: 'executive', requiresAgency: false },
		{ id: 'secretary', label: 'Secretary', groupId: 'executive', requiresAgency: false },
		{ id: 'technical_administrator', label: 'Technical Administrator', groupId: 'system_administrator', requiresAgency: false },
		{ id: 'main_administrator', label: 'Main Administrator', groupId: 'system_administrator', requiresAgency: false }
	];

	var AGENCY_OPTIONS = [
		'Philippine Council for Industry, Energy and Emerging Technology Research and Development',
		'PAGASA',
		'FNRI',
		'PCAARRD',
		'NRCP',
		'DOST-PES',
		'DOST Central Office',
		'Region VII',
		'Budget Division'
	];

	var MAX_NAME_LENGTH = 120;
	var MAX_LOGIN_LENGTH = 120;

	var USERS_LIST = [
		{
			id: 'usr-001',
			fullName: 'Maria Santos',
			loginId: 'maria.santos@dost.gov.ph',
			mainUserGroup: 'system_user',
			role: 'requester',
			agencyOffice: 'Philippine Council for Industry, Energy and Emerging Technology Research and Development',
			status: 'Active',
			lastUpdated: '2026-06-20T08:00:00.000Z'
		},
		{
			id: 'usr-002',
			fullName: 'Ana Reyes',
			loginId: 'ana.reyes@dost.gov.ph',
			mainUserGroup: 'system_user',
			role: 'project_development_officer',
			agencyOffice: 'DOST Central Office',
			status: 'Active',
			lastUpdated: '2026-06-18T10:30:00.000Z'
		},
		{
			id: 'usr-003',
			fullName: 'Pedro Lim',
			loginId: 'pedro.lim@dost.gov.ph',
			mainUserGroup: 'system_user',
			role: 'finance_officer',
			agencyOffice: 'DOST Central Office',
			status: 'Active',
			lastUpdated: '2026-06-15T14:00:00.000Z'
		},
		{
			id: 'usr-004',
			fullName: 'Dr. Elena Reyes',
			loginId: 'elena.reyes@dost.gov.ph',
			mainUserGroup: 'executive',
			role: 'planning_director',
			agencyOffice: 'DOST Central Office',
			status: 'Active',
			lastUpdated: '2026-06-12T09:00:00.000Z'
		},
		{
			id: 'usr-005',
			fullName: 'Rosa Mendoza',
			loginId: 'rosa.mendoza@dost.gov.ph',
			mainUserGroup: 'system_administrator',
			role: 'main_administrator',
			agencyOffice: 'DOST Central Office',
			status: 'Active',
			lastUpdated: '2026-06-10T09:00:00.000Z'
		}
	];
