/**
*System Name: Budget Management System
*Module Name: internal_review_app
*
*Purpose of this file:
*Internal review queue and detail prototype application logic.
*
*Author: none
*
*Copyright (C) 2026
*by the Department of Science and Technology - Central Office
*
*All rights reserved.
*/

(function internalReviewPrototype()
{
	'use strict';

	function computeReviewRequestTotals(arrProjects)
	{
		var objTotals = { PS: 0, MOOE: 0, CO: 0, grand: 0 };
		(arrProjects || []).forEach(function(objProject)
		{
			if (!objProject.totals) return;
			objTotals.PS += objProject.totals.PS || 0;
			objTotals.MOOE += objProject.totals.MOOE || 0;
			objTotals.CO += objProject.totals.CO || 0;
			objTotals.grand += objProject.totals.grand || 0;
		});
		return objTotals;
	}

	function createReviewVersionEntry(objRequest, objPreset)
	{
		return {
			versionNumber: objPreset.versionNumber,
			dateTime: objPreset.dateTime,
			userName: objPreset.userName,
			userRole: objPreset.userRole,
			status: objPreset.status,
			currentStage: objPreset.currentStage,
			remarks: objPreset.remarks || '',
			snapshot: {
				general: {
					referenceNo: objRequest.referenceNo,
					title: objRequest.title || objRequest.referenceNo,
					description: objRequest.description || '',
					submittedBy: objPreset.submittedBy || objRequest.submittedBy,
					submittedDate: objPreset.submittedDate || objRequest.submittedDate,
					status: objPreset.status,
					currentStage: objPreset.currentStage
				},
				projects: JSON.parse(JSON.stringify(objRequest.projects)),
				totals: computeReviewRequestTotals(objRequest.projects)
			}
		};
	}

	function initReviewVersions()
	{
		Object.keys(VERSION_PRESETS).forEach(function(strId)
		{
			var objRequest = REVIEW_REQUESTS[strId];
			if (!objRequest) return;
			objRequest.versions = VERSION_PRESETS[strId].map(function(objPreset)
			{
				return createReviewVersionEntry(objRequest, objPreset);
			});
			delete objRequest.version;
		});
	}

	initReviewVersions();

	var state = {
		view: 'queue',
		selectedRequestId: null,
		detailTab: 'main',
		selectedProjectId: null,
		projectDetailTab: 'info',
		measureExpanded: {},
		budgetGroupExpanded: { PS: true, MOOE: true, CO: true },
		versionProjectExpanded: {},
		versionExpanded: {},
		queueFilters: {
			search: '',
			fiscalYear: '',
			requestingUnit: '',
			status: '',
			stage: ''
		},
		queueAppliedFilters: {
			search: '',
			fiscalYear: '',
			requestingUnit: '',
			status: '',
			stage: ''
		},
		queueCurrentPage: 1,
		queueSortKey: 'lastUpdated',
		queueSortDir: 'desc',
		reviewForm: {
			decision: 'Validate',
			reason: 'For Clarification',
			otherReason: '',
			remark: ''
		},
		statusOverrides: {}
	};

	var confirmModal = null;
	var elAppRoot = document.getElementById('ir-app-root');

	var escapeHtml = PrototypeUi.escapeHtml;
	var formatCurrency = PrototypeUi.formatCurrency;
	var formatTimestamp = PrototypeUi.formatTimestamp;

	function getWorkflowState(strRequestId)
	{
		var objAll = JSON.parse(localStorage.getItem(WORKFLOW_STORAGE_KEY) || '{}');
		return objAll[strRequestId] || null;
	}

	function saveWorkflowState(strRequestId, objPatch)
	{
		var objAll = JSON.parse(localStorage.getItem(WORKFLOW_STORAGE_KEY) || '{}');
		objAll[strRequestId] = Object.assign({}, objAll[strRequestId] || {}, objPatch);
		localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(objAll));
	}

	function loadStoredWorkflowState()
	{
		var objAll = JSON.parse(localStorage.getItem(WORKFLOW_STORAGE_KEY) || '{}');
		Object.keys(objAll).forEach(function(strId)
		{
			var objStored = objAll[strId];
			var objQueue = QUEUE_ITEMS.find(function(q) { return q.id === strId; });
			var objRequest = REVIEW_REQUESTS[strId];
			if (objQueue)
			{
				if (objStored.status) objQueue.status = objStored.status;
				if (objStored.currentStage) objQueue.currentStage = objStored.currentStage;
				if (objStored.lastUpdated) objQueue.lastUpdated = objStored.lastUpdated;
			}
			if (objRequest)
			{
				if (objStored.status) objRequest.status = objStored.status;
				if (objStored.currentStage) objRequest.currentStage = objStored.currentStage;
				if (objStored.workflowStage) objRequest.workflowStage = objStored.workflowStage;
				if (objStored.returnReason !== undefined) objRequest.returnReason = objStored.returnReason;
				if (objStored.reviewHistory) objRequest.reviewHistory = objStored.reviewHistory;
			}
		});
	}

	function getReviewerForStage(strWorkflowStage)
	{
		var objStage = REVIEW_STAGE_CHAIN.find(function(s) { return s.id === strWorkflowStage; });
		return objStage || REVIEW_STAGE_CHAIN[0];
	}

	function getNextReviewStage(strWorkflowStage)
	{
		var intIdx = REVIEW_STAGE_CHAIN.findIndex(function(s) { return s.id === strWorkflowStage; });
		if (intIdx < 0 || intIdx >= REVIEW_STAGE_CHAIN.length - 1) return null;
		return REVIEW_STAGE_CHAIN[intIdx + 1];
	}

	function canReviewRequest(objRequest)
	{
		return objRequest.status === 'Pending' &&
			(objRequest.workflowStage === 'pdo' || objRequest.workflowStage === 'fo');
	}

	function persistWorkflowSnapshot(strRequestId, objRequest)
	{
		saveWorkflowState(strRequestId, {
			status: objRequest.status,
			currentStage: objRequest.currentStage,
			workflowStage: objRequest.workflowStage,
			returnReason: objRequest.returnReason || null,
			reviewHistory: objRequest.reviewHistory,
			lastUpdated: new Date().toISOString()
		});
	}

	function normalizeJustificationPost(objEntry, intIndex)
	{
		return {
			id: objEntry.id || ('just-' + intIndex),
			text: String(objEntry.text || ''),
			postedAt: objEntry.postedAt || objEntry.commentedAt || null,
			postedBy: objEntry.postedBy || objEntry.commentedBy || null
		};
	}

	function normalizeJustificationPosts(objValue)
	{
		if (Array.isArray(objValue))
		{
			return objValue.map(function(objEntry, intIndex)
			{
				return normalizeJustificationPost(objEntry, intIndex);
			}).filter(function(objEntry)
			{
				return String(objEntry.text || '').trim() !== '';
			});
		}

		if (objValue && typeof objValue === 'object')
		{
			var strText = String(objValue.text || '').trim();
			if (!strText) return [];
			return [normalizeJustificationPost(objValue, 0)];
		}

		var strLegacyText = String(objValue || '').trim();
		if (!strLegacyText) return [];
		return [{
			id: 'just-legacy-0',
			text: strLegacyText,
			postedAt: null,
			postedBy: null
		}];
	}

	function renderActorMeta(strActorLabel, strBy, strAt)
	{
		if (!strBy && !strAt) return '';
		var strParts = [];
		if (strBy) strParts.push(strActorLabel + ' ' + strBy);
		if (strAt) strParts.push(formatTimestamp(strAt));
		return '<div class="ir-attachment-card__meta mt-1">' + escapeHtml(strParts.join(' · ')) + '</div>';
	}

	function getJustificationPosts(objRequest)
	{
		return normalizeJustificationPosts(objRequest.justificationPosts || objRequest.justification);
	}

	function renderJustificationPostsList(objRequest)
	{
		var arrPosts = getJustificationPosts(objRequest);
		if (!arrPosts.length)
		{
			return '<p class="text-muted small mb-0">No justification posted.</p>';
		}

		return arrPosts.map(function(objPost)
		{
			return '<div class="ir-justification-post">' +
				'<div class="ir-justification-post__text">' + escapeHtml(objPost.text) + '</div>' +
				renderActorMeta('Posted by', objPost.postedBy, objPost.postedAt) +
			'</div>';
		}).join('');
	}

	function formatFileSize(intBytes)
	{
		var num = Number(intBytes) || 0;
		if (num < 1024) return num + ' B';
		if (num < 1048576) return (num / 1024).toFixed(1) + ' KB';
		return (num / 1048576).toFixed(1) + ' MB';
	}

	function renderSortIndicator(strKey, strActiveKey, strDir)
	{
		if (strActiveKey !== strKey) return '';
		return strDir === 'asc' ? ' ↑' : ' ↓';
	}

	function sortQueueItems(arrItems)
	{
		var strKey = state.queueSortKey;
		var intDir = state.queueSortDir === 'asc' ? 1 : -1;

		return arrItems.slice().sort(function(objA, objB)
		{
			var valA = strKey === 'status' ? getQueueItemStatus(objA) : objA[strKey];
			var valB = strKey === 'status' ? getQueueItemStatus(objB) : objB[strKey];

			if (strKey === 'grandTotal' || strKey === 'projectCount')
			{
				return (Number(valA) - Number(valB)) * intDir;
			}

			if (strKey === 'lastUpdated')
			{
				return (new Date(valA) - new Date(valB)) * intDir;
			}

			valA = String(valA || '').toLowerCase();
			valB = String(valB || '').toLowerCase();
			if (valA < valB) return -1 * intDir;
			if (valA > valB) return 1 * intDir;
			return 0;
		});
	}

	function getStatusBadgeClass(strStatus)
	{
		var strNorm = String(strStatus || '').toLowerCase();
		if (strNorm.indexOf('reviewed') >= 0) return 'status-badge--validated';
		if (strNorm.indexOf('validated') >= 0) return 'status-badge--validated';
		if (strNorm.indexOf('returned') >= 0) return 'status-badge--returned';
		if (strNorm.indexOf('pending') >= 0) return 'status-badge--pending';
		if (strNorm.indexOf('complete') >= 0) return 'status-badge--complete';
		if (strNorm.indexOf('needs') >= 0) return 'status-badge--needs-review';
		return 'status-badge--draft';
	}

	function getQueueItemStatus(objItem)
	{
		return state.statusOverrides[objItem.id] || objItem.status;
	}

	function getActiveRequest()
	{
		return REVIEW_REQUESTS[state.selectedRequestId] || null;
	}

	function getActiveStatus()
	{
		var objRequest = getActiveRequest();
		if (!objRequest) return '';
		return state.statusOverrides[state.selectedRequestId] || objRequest.status;
	}

	function getSelectedProject()
	{
		var objRequest = getActiveRequest();
		if (!objRequest) return null;
		return objRequest.projects.find(function(p) { return p.id === state.selectedProjectId; }) || objRequest.projects[0] || null;
	}

	function buildWorkflowSteps(strStage)
	{
		var arrDefs = [
			{ id: 'ru', title: 'Agency Name', actorRole: 'Agency Name' },
			{ id: 'pdo', title: 'PDO Review', actorRole: 'Planning and Development Office' },
			{ id: 'fo', title: 'FO Review', actorRole: 'Finance Office' },
			{ id: 'ready', title: 'Ready for Consolidation', actorRole: 'Budget Consolidation' }
		];
		var arrOrder = ['ru', 'pdo', 'fo', 'ready'];
		var strStageKey = strStage || 'pdo';
		if (strStageKey === 'consolidated') strStageKey = 'ready';
		var intCurrentIdx = arrOrder.indexOf(strStageKey);
		if (intCurrentIdx < 0) intCurrentIdx = 1;

		return arrDefs.map(function(objDef, intIdx)
		{
			var strStatus = 'locked';
			var strStatusText = '';
			if (intIdx < intCurrentIdx) strStatus = 'done';
			else if (intIdx === intCurrentIdx) { strStatus = 'current'; strStatusText = 'In progress'; }
			else strStatusText = 'Pending';
			return {
				title: objDef.title,
				actorRole: objDef.actorRole,
				status: strStatus,
				statusText: strStatusText
			};
		});
	}

	function renderWorkflowPanel(strStage)
	{
		var arrSteps = buildWorkflowSteps(strStage);
		var strHtml = '<div class="ir-card"><p class="fw-bold section-eyebrow mb-1">Review Workflow</p>';
		strHtml += '<p class="workflow-subtitle">Chain of Custody</p>';

		arrSteps.forEach(function(objStep, intIndex)
		{
			var strNodeClass = 'workflow-node-' + objStep.status;
			var strConnectorClass = objStep.status === 'done' ? 'workflow-connector-done' : 'workflow-connector-locked';
			var strIcon = objStep.status === 'done' ? '✓' : (objStep.status === 'current' ? '◷' : '🔒');

			strHtml += '<div class="d-flex align-items-start gap-3">';
			strHtml += '<div class="workflow-stack">';
			strHtml += '<div class="workflow-node ' + strNodeClass + '">' + strIcon + '</div>';
			if (intIndex < arrSteps.length - 1)
			{
				strHtml += '<div class="workflow-connector ' + strConnectorClass + '"></div>';
			}
			strHtml += '</div><div class="mb-3">';
			strHtml += '<p class="workflow-title mb-0">' + escapeHtml(objStep.title) + '</p>';
			if (objStep.statusText) strHtml += '<p class="workflow-status">' + escapeHtml(objStep.statusText) + '</p>';
			strHtml += '<p class="workflow-actor">' + escapeHtml(objStep.actorRole) + '</p>';
			strHtml += '</div></div>';
		});

		strHtml += '</div>';
		return strHtml;
	}

	function getFilteredQueueItems()
	{
		var f = state.queueAppliedFilters;
		return QUEUE_ITEMS.filter(function(objItem)
		{
			var strSearch = f.search.toLowerCase().trim();
			var blnSearch = !strSearch
				|| objItem.referenceNo.toLowerCase().indexOf(strSearch) >= 0
				|| objItem.requestingUnit.toLowerCase().indexOf(strSearch) >= 0;
			var blnYear = !f.fiscalYear || objItem.fiscalYear === f.fiscalYear;
			var blnUnit = !f.requestingUnit || objItem.requestingUnit === f.requestingUnit;
			var blnStatus = !f.status || getQueueItemStatus(objItem) === f.status;
			var blnStage = !f.stage || objItem.currentStage === f.stage;
			return blnSearch && blnYear && blnUnit && blnStatus && blnStage;
		});
	}

	function getPaginatedQueueItems()
	{
		var arrFiltered = sortQueueItems(getFilteredQueueItems());
		var intTotal = arrFiltered.length;
		var intStart = (state.queueCurrentPage - 1) * QUEUE_PAGE_SIZE;
		return {
			items: arrFiltered.slice(intStart, intStart + QUEUE_PAGE_SIZE),
			total: intTotal
		};
	}

	function applyQueueFilters()
	{
		state.queueAppliedFilters = {
			search: state.queueFilters.search,
			fiscalYear: state.queueFilters.fiscalYear,
			requestingUnit: state.queueFilters.requestingUnit,
			status: state.queueFilters.status,
			stage: state.queueFilters.stage
		};
		state.queueCurrentPage = 1;
		renderPage();
	}

	function clearQueueFilters()
	{
		state.queueFilters = { search: '', fiscalYear: '', requestingUnit: '', status: '', stage: '' };
		state.queueAppliedFilters = { search: '', fiscalYear: '', requestingUnit: '', status: '', stage: '' };
		state.queueCurrentPage = 1;
		renderPage();
	}

	function renderQueue()
	{
		var objPage = getPaginatedQueueItems();
		var intLastPage = Math.max(1, Math.ceil(objPage.total / QUEUE_PAGE_SIZE));
		if (state.queueCurrentPage > intLastPage) state.queueCurrentPage = intLastPage;

		var strRows = objPage.items.map(function(objItem)
		{
			var strStatus = getQueueItemStatus(objItem);
			return '<tr>' +
				'<td class="fw-semibold">' + escapeHtml(objItem.referenceNo) + '</td>' +
				'<td>' + escapeHtml(objItem.requestingUnit) + '</td>' +
				'<td>' + escapeHtml(objItem.fiscalYear) + '</td>' +
				'<td>' + objItem.projectCount + ' project' + (objItem.projectCount === 1 ? '' : 's') + '</td>' +
				'<td class="text-end fw-semibold">' + formatCurrency(objItem.grandTotal) + '</td>' +
				'<td><span class="status-badge status-badge--stage">' + escapeHtml(objItem.currentStage) + '</span></td>' +
				'<td><span class="status-badge ' + getStatusBadgeClass(strStatus) + '">' + escapeHtml(strStatus) + '</span></td>' +
				'<td>' + escapeHtml(formatTimestamp(objItem.lastUpdated)) + '</td>' +
				'<td><button type="button" class="btn btn-sm btn-primary" data-review-id="' + escapeHtml(objItem.id) + '">Review</button></td>' +
			'</tr>';
		}).join('');

		if (!strRows)
		{
			strRows = '<tr><td colspan="9" class="text-center text-muted py-4">No budget requests match the current filters.</td></tr>';
		}

		var intFrom = objPage.total === 0 ? 0 : ((state.queueCurrentPage - 1) * QUEUE_PAGE_SIZE) + 1;
		var intTo = Math.min(state.queueCurrentPage * QUEUE_PAGE_SIZE, objPage.total);

		elAppRoot.innerHTML =
			'<div class="br-list-page">' +
				'<header class="br-list-page__header">' +
					'<div>' +
						'<h1>Internal Review Queue</h1>' +
						'<p>Review submitted Budget Requests and validate or return them.</p>' +
					'</div>' +
				'</header>' +
				'<div class="br-card">' +
					'<div class="br-filters br-filters--extended">' +
						'<div><label class="form-label small" for="filter-search">Search</label><input type="search" class="form-control form-control-sm" id="filter-search" placeholder="Reference no. or agency name" value="' + escapeHtml(state.queueFilters.search) + '"></div>' +
						'<div><label class="form-label small" for="filter-year">Fiscal Year</label><select class="form-select form-select-sm" id="filter-year"><option value="">All</option><option value="2027"' + (state.queueFilters.fiscalYear === '2027' ? ' selected' : '') + '>2027</option><option value="2026"' + (state.queueFilters.fiscalYear === '2026' ? ' selected' : '') + '>2026</option></select></div>' +
						'<div><label class="form-label small" for="filter-unit">Agency Name</label><select class="form-select form-select-sm" id="filter-unit"><option value="">All</option><option value="DOST-PES"' + (state.queueFilters.requestingUnit === 'DOST-PES' ? ' selected' : '') + '>DOST-PES</option><option value="Region VII"' + (state.queueFilters.requestingUnit === 'Region VII' ? ' selected' : '') + '>Region VII</option><option value="DOST Central Office"' + (state.queueFilters.requestingUnit === 'DOST Central Office' ? ' selected' : '') + '>DOST Central Office</option></select></div>' +
						'<div><label class="form-label small" for="filter-status">Status</label><select class="form-select form-select-sm" id="filter-status"><option value="">All</option><option value="Pending"' + (state.queueFilters.status === 'Pending' ? ' selected' : '') + '>Pending</option><option value="Returned"' + (state.queueFilters.status === 'Returned' ? ' selected' : '') + '>Returned</option><option value="Reviewed"' + (state.queueFilters.status === 'Reviewed' ? ' selected' : '') + '>Reviewed</option></select></div>' +
						'<div><label class="form-label small" for="filter-stage">Current Stage</label><select class="form-select form-select-sm" id="filter-stage"><option value="">All</option><option value="PDO Review"' + (state.queueFilters.stage === 'PDO Review' ? ' selected' : '') + '>PDO Review</option><option value="FO Review"' + (state.queueFilters.stage === 'FO Review' ? ' selected' : '') + '>FO Review</option></select></div>' +
						'<div class="br-filter-actions">' +
							'<button type="button" class="btn btn-primary btn-sm" id="btn-apply-filters">Apply Filters</button>' +
							'<button type="button" class="btn btn-outline-secondary btn-sm" id="btn-clear-filters">Clear Filters</button>' +
						'</div>' +
					'</div>' +
					'<div class="br-table-wrap">' +
						'<table class="br-table">' +
							'<thead><tr>' +
								'<th class="br-table__sortable" data-sort="referenceNo">Reference No.' + renderSortIndicator('referenceNo', state.queueSortKey, state.queueSortDir) + '</th>' +
								'<th class="br-table__sortable" data-sort="requestingUnit">Agency Name' + renderSortIndicator('requestingUnit', state.queueSortKey, state.queueSortDir) + '</th>' +
								'<th class="br-table__sortable" data-sort="fiscalYear">Fiscal Year' + renderSortIndicator('fiscalYear', state.queueSortKey, state.queueSortDir) + '</th>' +
								'<th class="br-table__sortable" data-sort="projectCount">Projects' + renderSortIndicator('projectCount', state.queueSortKey, state.queueSortDir) + '</th>' +
								'<th class="br-table__sortable text-end" data-sort="grandTotal">Grand Total' + renderSortIndicator('grandTotal', state.queueSortKey, state.queueSortDir) + '</th>' +
								'<th class="br-table__sortable" data-sort="currentStage">Current Stage' + renderSortIndicator('currentStage', state.queueSortKey, state.queueSortDir) + '</th>' +
								'<th class="br-table__sortable" data-sort="status">Status' + renderSortIndicator('status', state.queueSortKey, state.queueSortDir) + '</th>' +
								'<th class="br-table__sortable" data-sort="lastUpdated">Last Update' + renderSortIndicator('lastUpdated', state.queueSortKey, state.queueSortDir) + '</th>' +
								'<th>Action</th>' +
							'</tr></thead>' +
							'<tbody>' + strRows + '</tbody>' +
						'</table>' +
					'</div>' +
					'<div class="list-pagination">' +
						'<span>Showing ' + intFrom + '–' + intTo + ' of ' + objPage.total + '</span>' +
						'<div class="btn-group btn-group-sm">' +
							'<button type="button" class="btn btn-outline-secondary" id="btn-queue-prev-page"' + (state.queueCurrentPage <= 1 ? ' disabled' : '') + '>Previous</button>' +
							'<button type="button" class="btn btn-outline-secondary" disabled>Page ' + state.queueCurrentPage + ' / ' + intLastPage + '</button>' +
							'<button type="button" class="btn btn-outline-secondary" id="btn-queue-next-page"' + (state.queueCurrentPage >= intLastPage ? ' disabled' : '') + '>Next</button>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>';
	}

	function renderSummarySheet(objRequest)
	{
		var strProjectRows = objRequest.projects.map(function(objProject)
		{
			return '<tr>' +
				'<td>' + escapeHtml(objProject.name) + '</td>' +
				'<td class="text-end">' + formatCurrency(objProject.totals.PS) + '</td>' +
				'<td class="text-end">' + formatCurrency(objProject.totals.MOOE) + '</td>' +
				'<td class="text-end">' + formatCurrency(objProject.totals.CO) + '</td>' +
				'<td class="text-end fw-semibold">' + formatCurrency(objProject.totals.grand) + '</td>' +
			'</tr>';
		}).join('');

		var objGrand = { PS: 0, MOOE: 0, CO: 0, grand: 0 };
		objRequest.projects.forEach(function(p)
		{
			objGrand.PS += p.totals.PS;
			objGrand.MOOE += p.totals.MOOE;
			objGrand.CO += p.totals.CO;
			objGrand.grand += p.totals.grand;
		});

		return '<div class="ir-summary-sheet">' +
			'<dl class="ir-kv-list">' +
				'<dt>Reference No.</dt><dd>' + escapeHtml(objRequest.referenceNo) + '</dd>' +
				'<dt>Agency Name</dt><dd>' + escapeHtml(objRequest.requestingUnit) + '</dd>' +
				'<dt>Fiscal Year</dt><dd>' + escapeHtml(objRequest.fiscalYear) + '</dd>' +
				'<dt>Submitted By</dt><dd>' + escapeHtml(objRequest.submittedBy) + '</dd>' +
				'<dt>Submitted Date</dt><dd>' + escapeHtml(objRequest.submittedDate) + '</dd>' +
				// '<dt>Grand Total</dt><dd>' + formatCurrency(objRequest.grandTotal) + '</dd>' +
			'</dl>' +
			'<div class="ir-summary-sheet__table">' +
				'<p class="fw-semibold small text-uppercase text-muted mb-2">Project Summary by Allotment Case</p>' +
				'<table class="ir-compact-table">' +
					'<thead><tr><th>Project</th><th class="text-end">PS</th><th class="text-end">MOOE</th><th class="text-end">CO</th><th class="text-end">Total</th></tr></thead>' +
					'<tbody>' + strProjectRows + '</tbody>' +
					'<tfoot><tr><td>Grand Total</td><td class="text-end">' + formatCurrency(objGrand.PS) + '</td><td class="text-end">' + formatCurrency(objGrand.MOOE) + '</td><td class="text-end">' + formatCurrency(objGrand.CO) + '</td><td class="text-end">' + formatCurrency(objGrand.grand) + '</td></tr></tfoot>' +
				'</table>' +
			'</div>' +
		'</div>';
	}

	function renderProjectSummaryTable(objRequest)
	{
		var strRows = objRequest.projects.map(function(objProject)
		{
			var strSelected = objProject.id === state.selectedProjectId ? ' btn-primary' : ' btn-outline-primary';
			return '<tr>' +
				'<td class="fw-semibold">' + escapeHtml(objProject.name) + '</td>' +
				'<td>' + escapeHtml(objProject.programName) + '</td>' +
				'<td>' + escapeHtml(objProject.pillarCategory) + '</td>' +
				'<td class="text-end">' + formatCurrency(objProject.totals.PS) + '</td>' +
				'<td class="text-end">' + formatCurrency(objProject.totals.MOOE) + '</td>' +
				'<td class="text-end">' + formatCurrency(objProject.totals.CO) + '</td>' +
				'<td class="text-end fw-semibold">' + formatCurrency(objProject.totals.grand) + '</td>' +
				'<td><button type="button" class="btn btn-sm' + strSelected + '" data-view-project="' + escapeHtml(objProject.id) + '">View Details</button></td>' +
			'</tr>';
		}).join('');

		return '<div class="ir-table-wrap">' +
			'<table class="ir-table">' +
				'<thead><tr>' +
					'<th>Project Name</th><th>Program Name</th><th>Pillar Category</th>' +
					'<th class="text-end">PS Total</th><th class="text-end">MOOE Total</th><th class="text-end">CO Total</th><th class="text-end">Project Total</th><th>Action</th>' +
				'</tr></thead>' +
				'<tbody>' + strRows + '</tbody>' +
			'</table>' +
		'</div>';
	}

	function renderProjectInfoTab(objProject)
	{
		return '<div class="row">' +
			'<div class="col-md-6"><div class="ir-readonly-field"><div class="ir-readonly-field__label">Project Name</div><div class="ir-readonly-field__value">' + escapeHtml(objProject.name) + '</div></div></div>' +
			'<div class="col-md-6"><div class="ir-readonly-field"><div class="ir-readonly-field__label">Program Name</div><div class="ir-readonly-field__value">' + escapeHtml(objProject.programName) + '</div></div></div>' +
			'<div class="col-md-6"><div class="ir-readonly-field"><div class="ir-readonly-field__label">Pillar Category</div><div class="ir-readonly-field__value">' + escapeHtml(objProject.pillarCategory) + '</div></div></div>' +
			'<div class="col-12"><div class="ir-readonly-field"><div class="ir-readonly-field__label">Project Description</div><div class="ir-readonly-field__value">' + escapeHtml(objProject.description) + '</div></div></div>' +
		'</div>';
	}

	function renderPhysicalMeasuresTab(objProject)
	{
		var arrMeasureIds = Object.keys(MEASURE_TITLES);
		var strHtml = '';

		arrMeasureIds.forEach(function(strMeasureId)
		{
			var strTitle = MEASURE_TITLES[strMeasureId];
			var objMeasure = (objProject.physicalMeasures || []).find(function(m) { return m.measureId === strMeasureId; });
			var arrEntries = objMeasure ? (objMeasure.entries || []) : [];
			var blnExpanded = state.measureExpanded[strMeasureId] === true;
			var strExpandedClass = blnExpanded ? ' metric-accordion--expanded' : '';
			var strChevron = blnExpanded ? ' ▾' : ' ▸';

			strHtml += '<div class="metric-accordion' + strExpandedClass + '">';
			strHtml += '<div class="metric-accordion__header">';
			strHtml += '<button type="button" class="metric-accordion__toggle" data-toggle-measure="' + escapeHtml(strMeasureId) + '">' + escapeHtml(strTitle) + ' - ' + arrEntries.length + (arrEntries.length === 1 ? ' particular' : ' particulars') + strChevron + '</button>';
			strHtml += '</div>';

			if (blnExpanded)
			{
				strHtml += '<div class="metric-accordion__body">';
				if (arrEntries.length === 0)
				{
					strHtml += '<p class="metric-accordion__empty mb-0">No particulars recorded.</p>';
				}
				else
				{
					arrEntries.forEach(function(objEntry)
					{
						strHtml += '<div class="particular-row">' +
							'<span class="particular-row__label">' + escapeHtml(objEntry.particular) + '</span>' +
							'<span class="particular-row__qty">Qty: ' + escapeHtml(objEntry.quantity) + '</span>' +
							'<span class="particular-row__spec">' + escapeHtml(objEntry.specification) + '</span>' +
						'</div>';
					});
				}
				strHtml += '</div>';
			}
			strHtml += '</div>';
		});

		return strHtml;
	}

	function renderLineBudgetTab(objProject)
	{
		var arrGroups = [
			{ key: 'PS', label: 'PS - Personal Services', css: 'ps' },
			{ key: 'MOOE', label: 'MOOE - Maintenance and Other Operating Expenses', css: 'mooe' },
			{ key: 'CO', label: 'CO - Capital Outlay', css: 'co' }
		];

		return arrGroups.map(function(objGroup)
		{
			var arrItems = (objProject.lineItems && objProject.lineItems[objGroup.key]) || [];
			var dblSubtotal = arrItems.reduce(function(sum, item) { return sum + (Number(item.amount) || 0); }, 0);
			var blnExpanded = state.budgetGroupExpanded[objGroup.key] !== false;
			var strChevron = blnExpanded ? '▾' : '▸';

			var strItems = arrItems.map(function(objItem)
			{
				return '<div class="line-item-row"><span>' + escapeHtml(objItem.label) + '</span><span class="fw-semibold">' + formatCurrency(objItem.amount) + '</span></div>';
			}).join('');

			var strBody = blnExpanded
				? '<div class="allotment-group__body">' + (strItems || '<p class="small text-muted mb-0 py-2">No line items.</p>') +
					'<div class="allotment-subtotal"><span>Subtotal</span><span>' + formatCurrency(dblSubtotal) + '</span></div></div>'
				: '';

			return '<div class="allotment-group allotment-group--' + objGroup.css + '">' +
				'<div class="allotment-group__header" data-toggle-budget="' + objGroup.key + '">' +
					'<span>' + escapeHtml(objGroup.label) + '</span><span>' + strChevron + '</span>' +
				'</div>' + strBody +
			'</div>';
		}).join('');
	}

	function renderProjectViewer(objProject)
	{
		if (!objProject) return '<p class="text-muted mb-0">Select a project to view details.</p>';

		var arrTabs = [
			{ id: 'info', label: 'Project Info' },
			{ id: 'measures', label: 'Physical Measures' },
			{ id: 'budget', label: 'Line Item Budget' }
		];

		var strTabBtns = arrTabs.map(function(objTab)
		{
			var strActive = state.projectDetailTab === objTab.id ? ' ir-project-tabs__btn--active' : '';
			return '<button type="button" class="ir-project-tabs__btn' + strActive + '" data-project-tab="' + objTab.id + '">' + escapeHtml(objTab.label) + '</button>';
		}).join('');

		var strContent = '';
		if (state.projectDetailTab === 'info') strContent = renderProjectInfoTab(objProject);
		else if (state.projectDetailTab === 'measures') strContent = renderPhysicalMeasuresTab(objProject);
		else strContent = renderLineBudgetTab(objProject);

		return '<div class="ir-project-viewer__header">' +
				'<div><h3 class="h5 mb-1 fw-bold">' + escapeHtml(objProject.name) + '</h3><span class="text-muted small">Project total: ' + formatCurrency(objProject.totals.grand) + '</span></div>' +
			'</div>' +
			'<div class="ir-project-tabs">' + strTabBtns + '</div>' +
			strContent;
	}

	function renderReviewActionCard()
	{
		var blnIsReturn = state.reviewForm.decision === 'Return';
		var blnShowOther = state.reviewForm.reason === 'Others';
		var strBtnText = blnIsReturn ? 'Return Request' : 'Validate Request';
		var strReasonBlock = '';

		if (blnIsReturn)
		{
			strReasonBlock = '<div class="mb-3"><label class="form-label" for="review-reason">Reason</label>' +
				'<select class="form-select form-select-sm" id="review-reason">' +
					['For Clarification', 'For Revision', 'Provide Breakdown', 'Others'].map(function(strOpt)
					{
						return '<option value="' + strOpt + '"' + (state.reviewForm.reason === strOpt ? ' selected' : '') + '>' + strOpt + '</option>';
					}).join('') +
				'</select></div>' +
				(blnShowOther
					? '<div class="mb-3" id="review-other-wrap"><label class="form-label" for="review-other">Specify Other Reason</label><input type="text" class="form-control form-control-sm" id="review-other" value="' + escapeHtml(state.reviewForm.otherReason) + '"></div>'
					: '<div class="mb-3 d-none" id="review-other-wrap"><label class="form-label" for="review-other">Specify Other Reason</label><input type="text" class="form-control form-control-sm" id="review-other" value="' + escapeHtml(state.reviewForm.otherReason) + '"></div>');
		}

		return '<div class="ir-card">' +
			'<p class="fw-bold section-eyebrow mb-3">Review Action</p>' +
			'<div class="mb-3"><label class="form-label" for="review-decision">Decision</label>' +
				'<select class="form-select form-select-sm" id="review-decision">' +
					'<option value="Validate"' + (state.reviewForm.decision === 'Validate' ? ' selected' : '') + '>Validate</option>' +
					'<option value="Return"' + (state.reviewForm.decision === 'Return' ? ' selected' : '') + '>Return</option>' +
				'</select></div>' +
			strReasonBlock +
			'<div class="mb-3"><label class="form-label" for="review-remark">Remark</label><textarea class="form-control form-control-sm" id="review-remark" rows="3" placeholder="Enter review remark">' + escapeHtml(state.reviewForm.remark) + '</textarea></div>' +
			'<button type="button" class="btn btn-primary w-100" id="btn-submit-review">' + strBtnText + '</button>' +
		'</div>';
	}

	function renderReviewHistoryTab(objRequest)
	{
		var strRows = (objRequest.reviewHistory || []).map(function(objRow)
		{
			return '<tr>' +
				'<td>' + escapeHtml(objRow.date) + '</td>' +
				'<td>' + escapeHtml(objRow.user) + '</td>' +
				'<td>' + escapeHtml(objRow.role) + '</td>' +
				'<td>' + escapeHtml(objRow.action) + '</td>' +
				'<td>' + escapeHtml(objRow.reason || '-') + '</td>' +
				'<td>' + escapeHtml(objRow.target) + '</td>' +
				'<td>' + escapeHtml(objRow.remark) + '</td>' +
			'</tr>';
		}).join('');

		return '<div class="ir-card">' +
			'<div class="ir-table-wrap">' +
				'<table class="ir-table">' +
					'<thead><tr><th>Date</th><th>User</th><th>Role</th><th>Action</th><th>Reason</th><th>Target</th><th>Remark</th></tr></thead>' +
					'<tbody>' + (strRows || '<tr><td colspan="7" class="text-muted">No review history yet.</td></tr>') + '</tbody>' +
				'</table>' +
			'</div>' +
		'</div>';
	}

	function renderVersionProjectDetails(objProject)
	{
		var strMeasures = (objProject.physicalMeasures || []).map(function(objMeasure)
		{
			var strTitle = MEASURE_TITLES[objMeasure.measureId] || objMeasure.measureId;
			var strRows = (objMeasure.entries || []).map(function(e)
			{
				return '<tr><td>' + escapeHtml(e.particular) + '</td><td>' + escapeHtml(e.quantity) + '</td><td>' + escapeHtml(e.specification) + '</td></tr>';
			}).join('');
			if (!strRows) return '';
			return '<p class="small fw-semibold mb-1">' + escapeHtml(strTitle) + '</p>' +
				'<table class="ir-compact-table mb-3"><thead><tr><th>Particular</th><th>Qty</th><th>Specification</th></tr></thead><tbody>' + strRows + '</tbody></table>';
		}).join('');

		var strLineRows = ['PS', 'MOOE', 'CO'].map(function(strKey)
		{
			return ((objProject.lineItems && objProject.lineItems[strKey]) || []).map(function(objItem)
			{
				return '<tr><td>' + strKey + '</td><td>' + escapeHtml(objItem.label) + '</td><td class="text-end">' + formatCurrency(objItem.amount) + '</td></tr>';
			}).join('');
		}).join('');

		return '<div class="version-snapshot-section"><h6>Project Information</h6>' +
			'<p class="small mb-1"><strong>Program:</strong> ' + escapeHtml(objProject.programName) + '</p>' +
			'<p class="small mb-1"><strong>Pillar:</strong> ' + escapeHtml(objProject.pillarCategory) + '</p>' +
			'<p class="small mb-0">' + escapeHtml(objProject.description) + '</p></div>' +
			'<div class="version-snapshot-section"><h6>Physical Measures</h6>' + (strMeasures || '<p class="small text-muted">None recorded.</p>') + '</div>' +
			'<div class="version-snapshot-section"><h6>Line Item Budget</h6>' +
				'<table class="ir-compact-table mb-2"><thead><tr><th>Case</th><th>Expense Item</th><th class="text-end">Amount</th></tr></thead><tbody>' + strLineRows + '</tbody></table>' +
				'<div class="small">PS: ' + formatCurrency(objProject.totals.PS) + ' · MOOE: ' + formatCurrency(objProject.totals.MOOE) + ' · CO: ' + formatCurrency(objProject.totals.CO) + ' · Project Total: ' + formatCurrency(objProject.totals.grand) + '</div>' +
			'</div>';
	}

	function getVersionExpandKey(intVersionNumber)
	{
		return 'version-' + intVersionNumber;
	}

	function isVersionExpanded(intVersionNumber, blnIsLatest)
	{
		var strKey = getVersionExpandKey(intVersionNumber);
		if (state.versionExpanded[strKey] !== undefined) return state.versionExpanded[strKey] === true;
		return blnIsLatest === true;
	}

	function renderVersionGeneralInfo(objGeneral)
	{
		if (!objGeneral) return '';
		return '<div class="version-snapshot-section"><h6>Budget Request Information</h6>' +
			'<dl class="row mb-0 small">' +
				'<dt class="col-sm-4">Reference No.</dt><dd class="col-sm-8">' + escapeHtml(objGeneral.referenceNo || '-') + '</dd>' +
				'<dt class="col-sm-4">Title</dt><dd class="col-sm-8">' + escapeHtml(objGeneral.title || '-') + '</dd>' +
				'<dt class="col-sm-4">Description</dt><dd class="col-sm-8">' + escapeHtml(objGeneral.description || '-') + '</dd>' +
				'<dt class="col-sm-4">Submitted By</dt><dd class="col-sm-8">' + escapeHtml(objGeneral.submittedBy || '-') + '</dd>' +
				'<dt class="col-sm-4">Submitted Date</dt><dd class="col-sm-8">' + escapeHtml(objGeneral.submittedDate || '-') + '</dd>' +
				'<dt class="col-sm-4">Status</dt><dd class="col-sm-8"><span class="status-badge ' + getStatusBadgeClass(objGeneral.status) + '">' + escapeHtml(objGeneral.status || '-') + '</span></dd>' +
				'<dt class="col-sm-4">Current Stage</dt><dd class="col-sm-8"><span class="status-badge status-badge--stage">' + escapeHtml(objGeneral.currentStage || '-') + '</span></dd>' +
			'</dl>' +
		'</div>';
	}

	function renderVersionSnapshotBody(objRequest, intVersionNumber, objSnapshot)
	{
		var strProjectBlocks = (objSnapshot.projects || []).map(function(objProject)
		{
			var strKey = objRequest.referenceNo + '-v' + intVersionNumber + '-' + objProject.id;
			var blnExpanded = state.versionProjectExpanded[strKey] === true;
			var strExpandedClass = blnExpanded ? ' metric-accordion--expanded' : '';
			var strChevron = blnExpanded ? ' ▾' : ' ▸';

			var strHtml = '<div class="metric-accordion version-project-accordion' + strExpandedClass + '">';
			strHtml += '<div class="metric-accordion__header">';
			strHtml += '<button type="button" class="metric-accordion__toggle" data-toggle-version-project="' + escapeHtml(strKey) + '">' + escapeHtml(objProject.name) + strChevron + '</button>';
			strHtml += '<span class="version-project-accordion__total">' + formatCurrency(objProject.totals.grand) + '</span>';
			strHtml += '</div>';
			if (blnExpanded) strHtml += '<div class="metric-accordion__body">' + renderVersionProjectDetails(objProject) + '</div>';
			strHtml += '</div>';
			return strHtml;
		}).join('');

		return renderVersionGeneralInfo(objSnapshot.general) +
			strProjectBlocks +
			'<div class="border-top pt-3 mt-3">' +
				'<div class="d-flex justify-content-between small"><span>PS</span><span>' + formatCurrency(objSnapshot.totals.PS) + '</span></div>' +
				'<div class="d-flex justify-content-between small"><span>MOOE</span><span>' + formatCurrency(objSnapshot.totals.MOOE) + '</span></div>' +
				'<div class="d-flex justify-content-between small"><span>CO</span><span>' + formatCurrency(objSnapshot.totals.CO) + '</span></div>' +
				'<div class="d-flex justify-content-between fw-bold mt-2"><span>Grand Total</span><span>' + formatCurrency(objSnapshot.totals.grand) + '</span></div>' +
			'</div>';
	}

	function appendReviewVersion(objRequest, objPreset)
	{
		if (!objRequest.versions) objRequest.versions = [];
		objRequest.versions.push(createReviewVersionEntry(objRequest, objPreset));
	}

	function renderVersionTab(objRequest)
	{
		var arrVersions = (objRequest.versions || []).slice().sort(function(a, b)
		{
			return b.versionNumber - a.versionNumber;
		});

		if (arrVersions.length === 0)
		{
			return '<div class="ir-card"><p class="text-muted mb-0">No versions recorded for this request.</p></div>';
		}

		var intLatestVersion = arrVersions[0].versionNumber;

		return '<section class="ir-section ir-card">' +
			'<p class="fw-bold section-eyebrow mb-3">Version History</p>' +
			arrVersions.map(function(objVersion)
			{
				var blnExpanded = isVersionExpanded(objVersion.versionNumber, objVersion.versionNumber === intLatestVersion);
				var strExpandedClass = blnExpanded ? ' metric-accordion--expanded' : '';
				var strChevron = blnExpanded ? ' ▾' : ' ▸';

				var strHtml = '<div class="metric-accordion version-accordion' + strExpandedClass + '">';
				strHtml += '<div class="metric-accordion__header">';
				strHtml += '<button type="button" class="metric-accordion__toggle" data-toggle-version="' + objVersion.versionNumber + '">' +
					'Version ' + objVersion.versionNumber + ' · ' + escapeHtml(objVersion.dateTime) + strChevron +
				'</button>';
				strHtml += '<span class="status-badge ' + getStatusBadgeClass(objVersion.status) + '">' + escapeHtml(objVersion.status) + '</span>';
				strHtml += '</div>';

				if (blnExpanded)
				{
					strHtml += '<div class="metric-accordion__body"><div class="version-accordion__body-inner">';
					strHtml += '<div class="version-accordion__meta"><strong>' + escapeHtml(objVersion.userName) + '</strong> · ' + escapeHtml(objVersion.userRole);
					if (objVersion.remarks)
					{
						strHtml += '<br><em>' + escapeHtml(objVersion.remarks) + '</em>';
					}
					strHtml += '</div>';
					strHtml += renderVersionSnapshotBody(objRequest, objVersion.versionNumber, objVersion.snapshot);
					strHtml += '</div></div>';
				}

				strHtml += '</div>';
				return strHtml;
			}).join('') +
		'</section>';
	}

	function renderAttachmentsTab(objRequest)
	{
		var arrFiles = objRequest.attachedFiles || [];
		var strFileList = arrFiles.length ? arrFiles.map(function(objFile)
		{
			return '<div class="ir-attachment-card">' +
				'<div class="ir-attachment-card__name">' + escapeHtml(objFile.name) + '</div>' +
				'<div class="ir-attachment-card__meta">' + escapeHtml(formatFileSize(objFile.size)) +
					(objFile.type ? ' · ' + escapeHtml(objFile.type) : '') + '</div>' +
				renderActorMeta('Uploaded by', objFile.uploadedBy, objFile.uploadedAt) +
			'</div>';
		}).join('') : '<p class="text-muted small mb-0">No files attached.</p>';

		return '<section class="ir-section ir-card">' +
			'<p class="fw-bold section-eyebrow mb-3">Attached Files</p>' + strFileList +
		'</section>' +
		'<section class="ir-section ir-card">' +
			'<p class="fw-bold section-eyebrow mb-3">Justification</p>' +
			renderJustificationPostsList(objRequest) +
		'</section>';
	}

	function renderDetailMainContent(objRequest)
	{
		if (state.detailTab === 'history') return renderReviewHistoryTab(objRequest);
		if (state.detailTab === 'version') return renderVersionTab(objRequest);
		if (state.detailTab === 'attachments') return renderAttachmentsTab(objRequest);

		var objProject = getSelectedProject();
		return '<section class="ir-section ir-card"><p class="fw-bold section-eyebrow mb-3">Budget Request Summary</p>' + renderSummarySheet(objRequest) + '</section>' +
			'<section class="ir-section ir-card"><p class="fw-bold section-eyebrow mb-3">Project Summary</p>' + renderProjectSummaryTable(objRequest) + '</section>' +
			'<section class="ir-section ir-card"><p class="fw-bold section-eyebrow mb-3">Project Detail Viewer</p>' + renderProjectViewer(objProject) + '</section>';
	}

	function renderDetail()
	{
		var objRequest = getActiveRequest();
		if (!objRequest) { state.view = 'queue'; renderPage(); return; }

		var strStatus = getActiveStatus();
		var arrTabs = [
			{ id: 'main', label: 'Main Review' },
			{ id: 'attachments', label: 'Attachments & Justification' },
			{ id: 'history', label: 'Review History' },
			{ id: 'version', label: 'Version' }
		];

		var strTabBtns = arrTabs.map(function(objTab)
		{
			var strActive = state.detailTab === objTab.id ? ' ir-detail-tabs__btn--active' : '';
			return '<button type="button" class="ir-detail-tabs__btn' + strActive + '" data-detail-tab="' + objTab.id + '">' + escapeHtml(objTab.label) + '</button>';
		}).join('');

		var strSidebar = '';
		if (state.detailTab === 'main')
		{
			strSidebar = '<aside class="ir-detail-sidebar">' +
				(canReviewRequest(objRequest) ? renderReviewActionCard() : '') +
				renderWorkflowPanel(objRequest.workflowStage) +
			'</aside>';
		}

		elAppRoot.innerHTML =
			'<div class="ir-page">' +
				'<div class="ir-detail-toolbar"><button type="button" class="btn btn-outline-secondary btn-sm" id="btn-back-queue">← Back to Review Queue</button></div>' +
				'<header class="ir-detail-header">' +
					'<div class="ir-detail-header__top">' +
						'<div><h2>Review Budget Request</h2><p class="text-muted small mb-0">Reference: ' + escapeHtml(objRequest.referenceNo) + '</p></div>' +
						'<div class="d-flex gap-2 flex-wrap">' +
							'<span class="status-badge ' + getStatusBadgeClass(strStatus) + '">' + escapeHtml(strStatus) + '</span>' +
							'<span class="status-badge status-badge--stage">' + escapeHtml(objRequest.currentStage) + '</span>' +
						'</div>' +
					'</div>' +
					'<div class="ir-detail-meta">' +
						'<span><strong>Agency Name:</strong> ' + escapeHtml(objRequest.requestingUnit) + '</span>' +
						'<span><strong>Fiscal Year:</strong> ' + escapeHtml(objRequest.fiscalYear) + '</span>' +
					'</div>' +
				'</header>' +
				'<nav class="ir-detail-tabs" aria-label="Review detail tabs">' + strTabBtns + '</nav>' +
				'<div class="ir-detail-layout">' +
					'<div class="ir-detail-main">' + renderDetailMainContent(objRequest) + '</div>' +
					strSidebar +
				'</div>' +
			'</div>';
	}

	function showToast(strMessage)
	{
		var elToast = document.getElementById('ir-toast');
		elToast.textContent = strMessage;
		elToast.classList.add('ir-toast--visible');
		window.setTimeout(function()
		{
			elToast.classList.remove('ir-toast--visible');
		}, 3200);
	}

	function validateReviewForm()
	{
		if (!String(state.reviewForm.remark || '').trim()) return false;
		if (state.reviewForm.decision !== 'Return') return true;
		if (!String(state.reviewForm.reason || '').trim()) return false;
		if (state.reviewForm.reason === 'Others' && !String(state.reviewForm.otherReason || '').trim()) return false;
		return true;
	}

	function openConfirmModal()
	{
		var blnIsReturn = state.reviewForm.decision === 'Return';
		var strReason = state.reviewForm.reason === 'Others'
			? state.reviewForm.otherReason
			: state.reviewForm.reason;
		var strRemark = state.reviewForm.remark || '-';
		var strBody = '<dl class="mb-0">' +
			'<dt class="small text-muted">Decision</dt><dd class="fw-semibold">' + escapeHtml(state.reviewForm.decision) + '</dd>';

		if (blnIsReturn)
		{
			strBody += '<dt class="small text-muted">Reason</dt><dd>' + escapeHtml(strReason || '-') + '</dd>';
		}

		strBody += '<dt class="small text-muted">Remark</dt><dd>' + escapeHtml(strRemark) + '</dd></dl>';
		document.getElementById('confirm-review-modal-body').innerHTML = strBody;
		confirmModal.show();
	}

	function applyReviewDecision()
	{
		var objRequest = getActiveRequest();
		if (!objRequest) return;

		var strNow = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
		var objReviewer = getReviewerForStage(objRequest.workflowStage);
		var strRemark = String(state.reviewForm.remark || '').trim();
		var blnIsReturn = state.reviewForm.decision === 'Return';
		var strReason = '-';

		if (blnIsReturn)
		{
			strReason = state.reviewForm.reason === 'Others'
				? String(state.reviewForm.otherReason || '').trim()
				: state.reviewForm.reason;
		}

		if (!objRequest.reviewHistory) objRequest.reviewHistory = [];
		objRequest.reviewHistory.push({
			date: strNow,
			user: objReviewer.reviewerName,
			role: objReviewer.reviewerRole,
			action: blnIsReturn ? 'Returned' : 'Validated',
			reason: strReason,
			target: 'Entire Request',
			remark: strRemark
		});

		if (blnIsReturn)
		{
			objRequest.status = 'Returned';
			objRequest.returnReason = strReason;
			appendReviewVersion(objRequest, {
				versionNumber: (objRequest.versions ? objRequest.versions.length : 0) + 1,
				dateTime: strNow,
				userName: objReviewer.reviewerName,
				userRole: objReviewer.reviewerRole,
				status: 'Returned',
				currentStage: objRequest.currentStage,
				submittedBy: objRequest.submittedBy,
				submittedDate: objRequest.submittedDate,
				remarks: strRemark
			});
			state.versionExpanded[getVersionExpandKey((objRequest.versions || []).length)] = true;
		}
		else
		{
			var objNextStage = getNextReviewStage(objRequest.workflowStage);
			objRequest.returnReason = null;
			if (objNextStage)
			{
				objRequest.workflowStage = objNextStage.id;
				objRequest.currentStage = objNextStage.currentStage;
				objRequest.status = 'Pending';
			}
			else
			{
				objRequest.workflowStage = READY_FOR_CONSOLIDATION.id;
				objRequest.currentStage = READY_FOR_CONSOLIDATION.currentStage;
				objRequest.status = 'Reviewed';
			}
		}

		objRequest.lastUpdated = new Date().toISOString();
		var objQueue = QUEUE_ITEMS.find(function(q) { return q.id === state.selectedRequestId; });
		if (objQueue)
		{
			objQueue.status = objRequest.status;
			objQueue.currentStage = objRequest.currentStage;
			objQueue.lastUpdated = objRequest.lastUpdated;
		}
		state.statusOverrides[state.selectedRequestId] = objRequest.status;
		persistWorkflowSnapshot(state.selectedRequestId, objRequest);
		state.reviewForm = { decision: 'Validate', reason: 'For Clarification', otherReason: '', remark: '' };
	}

	function bindEvents()
	{
		var elSearch = document.getElementById('filter-search');
		if (elSearch)
		{
			elSearch.oninput = function(e)
			{
				state.queueFilters.search = e.target.value;
			};
			elSearch.onkeydown = function(e)
			{
				if (e.key === 'Enter') applyQueueFilters();
			};
		}

		['filter-year', 'filter-unit', 'filter-status', 'filter-stage'].forEach(function(strId)
		{
			var elSelect = document.getElementById(strId);
			if (!elSelect) return;
			var strKey = strId.replace('filter-', '');
			if (strKey === 'year') strKey = 'fiscalYear';
			if (strKey === 'unit') strKey = 'requestingUnit';
			elSelect.onchange = function(e)
			{
				state.queueFilters[strKey] = e.target.value;
			};
		});

		var elApply = document.getElementById('btn-apply-filters');
		if (elApply) elApply.onclick = applyQueueFilters;

		var elClear = document.getElementById('btn-clear-filters');
		if (elClear) elClear.onclick = clearQueueFilters;

		document.querySelectorAll('[data-sort]').forEach(function(elTh)
		{
			elTh.onclick = function()
			{
				var strKey = elTh.getAttribute('data-sort');
				if (state.queueSortKey === strKey)
				{
					state.queueSortDir = state.queueSortDir === 'asc' ? 'desc' : 'asc';
				}
				else
				{
					state.queueSortKey = strKey;
					state.queueSortDir = 'asc';
				}
				state.queueCurrentPage = 1;
				renderPage();
			};
		});

		var elPrev = document.getElementById('btn-queue-prev-page');
		if (elPrev) elPrev.onclick = function() { state.queueCurrentPage -= 1; renderPage(); };

		var elNext = document.getElementById('btn-queue-next-page');
		if (elNext) elNext.onclick = function() { state.queueCurrentPage += 1; renderPage(); };

		document.querySelectorAll('[data-review-id]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				state.selectedRequestId = elBtn.getAttribute('data-review-id');
				state.view = 'detail';
				state.detailTab = 'main';
				var objRequest = getActiveRequest();
				state.selectedProjectId = objRequest && objRequest.projects[0] ? objRequest.projects[0].id : null;
				state.reviewForm = { decision: 'Validate', reason: 'For Clarification', otherReason: '', remark: '' };
				renderPage();
			};
		});

		var elBack = document.getElementById('btn-back-queue');
		if (elBack) elBack.onclick = function() { state.view = 'queue'; renderPage(); };

		document.querySelectorAll('[data-detail-tab]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				state.detailTab = elBtn.getAttribute('data-detail-tab');
				renderPage();
			};
		});

		document.querySelectorAll('[data-view-project]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				state.selectedProjectId = elBtn.getAttribute('data-view-project');
				state.projectDetailTab = 'info';
				renderPage();
			};
		});

		document.querySelectorAll('[data-project-tab]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				state.projectDetailTab = elBtn.getAttribute('data-project-tab');
				renderPage();
			};
		});

		document.querySelectorAll('[data-toggle-measure]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				var strId = elBtn.getAttribute('data-toggle-measure');
				state.measureExpanded[strId] = !state.measureExpanded[strId];
				renderPage();
			};
		});

		document.querySelectorAll('[data-toggle-budget]').forEach(function(elEl)
		{
			elEl.onclick = function()
			{
				var strKey = elEl.getAttribute('data-toggle-budget');
				state.budgetGroupExpanded[strKey] = !state.budgetGroupExpanded[strKey];
				renderPage();
			};
		});

		document.querySelectorAll('[data-toggle-version]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				var intVersionNumber = Number(elBtn.getAttribute('data-toggle-version'));
				var strKey = getVersionExpandKey(intVersionNumber);
				state.versionExpanded[strKey] = !isVersionExpanded(intVersionNumber, false);
				renderPage();
			};
		});

		document.querySelectorAll('[data-toggle-version-project]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				var strKey = elBtn.getAttribute('data-toggle-version-project');
				state.versionProjectExpanded[strKey] = !state.versionProjectExpanded[strKey];
				renderPage();
			};
		});

		var elDecision = document.getElementById('review-decision');
		if (elDecision) elDecision.onchange = function(e) { state.reviewForm.decision = e.target.value; renderPage(); };

		var elReason = document.getElementById('review-reason');
		if (elReason) elReason.onchange = function(e) { state.reviewForm.reason = e.target.value; renderPage(); };

		var elOther = document.getElementById('review-other');
		if (elOther) elOther.oninput = function(e) { state.reviewForm.otherReason = e.target.value; };

		var elRemark = document.getElementById('review-remark');
		if (elRemark) elRemark.oninput = function(e) { state.reviewForm.remark = e.target.value; };

		var elSubmit = document.getElementById('btn-submit-review');
		if (elSubmit) elSubmit.onclick = function()
		{
			if (!validateReviewForm())
			{
				window.alert('Remark is required. When returning a request, reason is also required. If Reason is Others, specify the other reason.');
				return;
			}
			openConfirmModal();
		};
	}

	document.getElementById('btn-confirm-review').onclick = function()
	{
		var blnIsReturn = state.reviewForm.decision === 'Return';
		applyReviewDecision();
		confirmModal.hide();
		showToast(blnIsReturn ? 'Budget request returned successfully.' : 'Budget request validated successfully.');
		renderPage();
	};

	function renderPage()
	{
		if (state.view === 'queue') renderQueue();
		else renderDetail();
		bindEvents();
	}

	function init()
	{
		loadStoredWorkflowState();
		confirmModal = new bootstrap.Modal(document.getElementById('confirm-review-modal'));
		renderPage();
	}

	init();
})();
