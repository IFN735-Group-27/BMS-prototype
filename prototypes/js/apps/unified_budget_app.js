/**
*System Name: Budget Management System
*Module Name: unified_budget_app
*
*Purpose of this file:
*Unified Budget list and detail wizard prototype application logic.
*
*Author: none
*
*Copyright (C) 2026
*by the Department of Science and Technology - Central Office
*
*All rights reserved.
*/

(function unifiedBudgetPrototype()
{
	'use strict';

	var PAGE_SIZE = 5;
	var WIZARD_STEP_GENERAL = 1;
	var WIZARD_STEP_CONSOLIDATION = 2;
	var WIZARD_STEP_ATTACHMENTS = 3;
	var WIZARD_STEP_REVIEW = 4;
	var WIZARD_STEP_VERSION = 5;
	var WIZARD_STEP_APPROVAL_HISTORY = 6;
	var WIZARD_STEP_EXTERNAL_TRACKING = 7;

	var CURRENT_ACTOR_NAME = 'Budget Division';

	var ALLOTMENT_CASES = ['PS', 'MOOE', 'CO'];

	var STAGE_OPTIONS = [
		'Internal Consolidation',
		'Planning Director',
		'Finance Director',
		'USEC',
		'Secretary',
		'DBM',
		'Congress Committee',
		'Senate Committee',
		'Plenary Congress',
		'Plenary Senate',
		'President'
	];

	/* Mirrors approval-workflow-stages in mock db + Planning/Finance split (prototype). */
	var UNIFIED_WORKFLOW_STAGES = [
		{ stepKey: 'draft', title: 'Internal Consolidation', type: 'system', actorRole: 'Budget Division · PDO' },
		{ stepKey: 'planning_director', title: 'Planning Director', type: 'internal_approval', actorRole: 'Planning Director' },
		{ stepKey: 'finance_director', title: 'Finance Director', type: 'internal_approval', actorRole: 'Finance Director' },
		{ stepKey: 'usec', title: 'USEC', type: 'internal_approval', actorRole: 'Undersecretary' },
		{ stepKey: 'secretary', title: 'Secretary', type: 'internal_approval', actorRole: 'Secretary' },
		{ stepKey: 'dbm', title: 'DBM', type: 'external_approval', actorRole: 'Department of Budget and Management' },
		{ stepKey: 'congress_committee', title: 'Congress Committee', type: 'external_approval', actorRole: 'Congress Committee' },
		{ stepKey: 'senate_committee', title: 'Senate Committee', type: 'external_approval', actorRole: 'Senate Committee' },
		{ stepKey: 'plenary_congress', title: 'Plenary Congress', type: 'external_approval', actorRole: 'Plenary Congress' },
		{ stepKey: 'plenary_senate', title: 'Plenary Senate', type: 'external_approval', actorRole: 'Plenary Senate' },
		{ stepKey: 'president', title: 'President', type: 'external_approval', actorRole: 'President of the Philippines' }
	];

	var EXTERNAL_WORKFLOW_TYPES = { external_approval: true, review: true };

	var STATUS_OPTIONS = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];


	function computeRequestGrandTotal(objRequest)
	{
		return (objRequest.lines || []).reduce(function(dblSum, objLine)
		{
			return dblSum + (Number(objLine.amount) || 0);
		}, 0);
	}

	ELIGIBLE_BUDGET_REQUESTS.forEach(function(objReq)
	{
		objReq.grandTotal = computeRequestGrandTotal(objReq);
	});

	function createEmptyUb(strId, arrRequestIds)
	{
		var objUb = {
			id: strId,
			referenceNo: '',
			title: '',
			description: '',
			fiscalYear: '2027',
			grandTotal: 0,
			currentStage: 'Internal Consolidation',
			status: 'DRAFT',
			lastUpdated: new Date().toISOString(),
			includedRequestIds: arrRequestIds.slice(),
			submittedAt: null,
			versions: [],
			approvalHistory: [],
			attachedFiles: [],
			justificationPosts: [],
			externalTracking: {
				started: false,
				startedAt: '',
				startedBy: ''
			},
			externalDocuments: [],
			externalStageHistory: []
		};
		objUb.grandTotal = computeUbGrandTotal(objUb);
		return objUb;
	}

	var UNIFIED_BUDGETS = [
		(function()
		{
			var obj = createEmptyUb('ub-4', []);
			obj.referenceNo = 'UB-2026-001';
			obj.title = 'FY 2026 Consolidated Budget';
			obj.description = 'Approved consolidated budget for FY 2026.';
			obj.fiscalYear = '2026';
			obj.grandTotal = 15000000;
			obj.currentStage = 'President';
			obj.status = 'APPROVED';
			obj.lastUpdated = '2026-01-31T08:00:00.000Z';
			obj.submittedAt = 'Jan 10, 2026 • 10:00 AM';
			obj.externalTracking = {
				started: true,
				startedAt: '2026-01-12T08:00:00.000Z',
				startedBy: 'Budget Division'
			};
			obj.externalStageHistory = [
				{ id: 'ext-ub4-1', stageKey: 'dbm', stageTitle: 'DBM', decision: 'approved', remarks: 'NEBP certification received.', recordedAt: '2026-01-14T10:00:00.000Z', recordedBy: 'Budget Division' },
				{ id: 'ext-ub4-2', stageKey: 'congress_committee', stageTitle: 'Congress Committee', decision: 'approved', remarks: 'House committee endorsement recorded.', recordedAt: '2026-01-18T14:00:00.000Z', recordedBy: 'Budget Division' },
				{ id: 'ext-ub4-3', stageKey: 'senate_committee', stageTitle: 'Senate Committee', decision: 'approved', remarks: 'Senate committee clearance logged.', recordedAt: '2026-01-22T11:00:00.000Z', recordedBy: 'Budget Division' },
				{ id: 'ext-ub4-4', stageKey: 'plenary_congress', stageTitle: 'Plenary Congress', decision: 'approved', remarks: 'Third reading approval in Congress.', recordedAt: '2026-01-25T16:00:00.000Z', recordedBy: 'Budget Division' },
				{ id: 'ext-ub4-5', stageKey: 'plenary_senate', stageTitle: 'Plenary Senate', decision: 'approved', remarks: 'Senate plenary concurrence recorded.', recordedAt: '2026-01-28T09:00:00.000Z', recordedBy: 'Budget Division' },
				{ id: 'ext-ub4-6', stageKey: 'president', stageTitle: 'President', decision: 'approved', remarks: 'GAA signed into law.', recordedAt: '2026-01-31T08:00:00.000Z', recordedBy: 'Budget Division' }
			];
			obj.externalDocuments = [
				{ id: 'ext-doc-ub4-1', name: 'gaa-2026-signed.pdf', size: 1048576, type: 'application/pdf', stage: 'President', uploadedAt: '2026-01-31T08:30:00.000Z', uploadedBy: 'Budget Division' }
			];
			obj.approvalHistory = [
				{ date: 'Jan 10, 2026 • 10:00 AM', user: 'Budget Division', role: 'PDO', action: 'Submit', reason: 'Consolidation complete', remark: 'Submitted for internal approval.' },
				{ date: 'Jan 12, 2026 • 08:00 AM', user: 'Budget Division', role: 'PDO', action: 'Start External Tracking', reason: 'Internal approval complete', remark: 'External legislative review initiated.' }
			];
			return obj;
		})(),
		{
			id: 'ub-6',
			referenceNo: 'UB-2025-001',
			title: 'FY 2025 Consolidated Budget',
			description: 'Approved consolidated budget for FY 2025.',
			fiscalYear: '2025',
			grandTotal: 11200000,
			currentStage: 'President',
			status: 'APPROVED',
			lastUpdated: '2025-01-31T08:00:00.000Z',
			includedRequestIds: [],
			submittedAt: null,
			versions: [],
			approvalHistory: [],
			externalTracking: { started: true, startedAt: '2025-01-15T08:00:00.000Z', startedBy: 'Budget Division' },
			externalDocuments: [],
			externalStageHistory: []
		},
		{
			id: 'ub-7',
			referenceNo: 'UB-2024-001',
			title: 'FY 2024 Consolidated Budget',
			description: 'Approved consolidated budget for FY 2024.',
			fiscalYear: '2024',
			grandTotal: 10500000,
			currentStage: 'President',
			status: 'APPROVED',
			lastUpdated: '2024-01-31T08:00:00.000Z',
			includedRequestIds: [],
			submittedAt: null,
			versions: [],
			approvalHistory: [],
			externalTracking: { started: true, startedAt: '2024-01-15T08:00:00.000Z', startedBy: 'Budget Division' },
			externalDocuments: [],
			externalStageHistory: []
		}
	];

	var state = {
		view: 'list',
		detailMode: 'view',
		selectedUbId: null,
		workingUb: null,
		wizardStep: WIZARD_STEP_GENERAL,
		consolidationExpanded: {},
		versionTreeExpanded: {},
		versionExpanded: {},
		filters: { search: '', fiscalYear: '', status: '', stage: '' },
		appliedFilters: { search: '', fiscalYear: '', status: '', stage: '' },
		sortKey: 'lastUpdated',
		sortDir: 'desc',
		currentPage: 1,
		openActionMenuId: null,
		justificationDraft: '',
		reviewForm: {
			decision: 'Approve',
			reason: 'For Revision',
			otherReason: '',
			remark: ''
		},
		externalUpdateForm: {
			stageKey: '',
			decision: 'approved',
			remarks: ''
		}
	};

	var elListView = document.getElementById('ub-list-view');
	var elDetailView = document.getElementById('ub-detail-view');
	var elDetailHeader = document.getElementById('ub-detail-header');
	var elWizardStepper = document.getElementById('ub-wizard-stepper');
	var elDetailBody = document.getElementById('ub-detail-body');
	var elWizardContent = document.getElementById('ub-wizard-content');
	var elContextPanel = document.getElementById('ub-context-panel');
	var elDetailFooter = document.getElementById('ub-detail-footer');
	var elPageTitle = document.getElementById('ub-page-title');
	var consolidateModal = null;

	var escapeHtml = PrototypeUi.escapeHtml;
	var formatCurrency = PrototypeUi.formatCurrency;

	function formatTimestamp(strIso)
	{
		return PrototypeUi.formatTimestamp(strIso, '—');
	}

	function formatFileSize(intBytes)
	{
		var num = Number(intBytes) || 0;
		if (num < 1024) return num + ' B';
		if (num < 1048576) return (num / 1024).toFixed(1) + ' KB';
		return (num / 1048576).toFixed(1) + ' MB';
	}

	function getCurrentTimestampIso()
	{
		return new Date().toISOString();
	}

	function ensureUbAttachments(objUb)
	{
		if (!objUb.attachedFiles) objUb.attachedFiles = [];
		if (!objUb.justificationPosts) objUb.justificationPosts = [];
	}

	function ensureExternalTracking(objUb)
	{
		if (!objUb.externalTracking)
		{
			objUb.externalTracking = { started: false, startedAt: '', startedBy: '' };
		}
		if (!objUb.externalDocuments) objUb.externalDocuments = [];
		if (!objUb.externalStageHistory) objUb.externalStageHistory = [];
	}

	function formatDisplayNow()
	{
		return new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
	}

	function getSecretaryStageIndex()
	{
		return UNIFIED_WORKFLOW_STAGES.findIndex(function(objStage) { return objStage.stepKey === 'secretary'; });
	}

	function getFirstExternalStageIndex()
	{
		return UNIFIED_WORKFLOW_STAGES.findIndex(function(objStage)
		{
			return EXTERNAL_WORKFLOW_TYPES[String(objStage.type || '').toLowerCase()];
		});
	}

	function isInternalApprovalComplete(objUb)
	{
		if (!objUb) return false;
		var strStatus = String(objUb.status || '').toUpperCase();
		if (strStatus === 'DRAFT' || strStatus === 'REJECTED') return false;
		var intSecretaryIdx = getSecretaryStageIndex();
		var intCurrentIdx = resolveCurrentStageIndex(objUb.currentStage);
		return intCurrentIdx > intSecretaryIdx;
	}

	function isExternalTrackingStarted(objUb)
	{
		ensureExternalTracking(objUb);
		return objUb.externalTracking.started === true;
	}

	function isExternalTrackingVisible(objUb)
	{
		return isInternalApprovalComplete(objUb);
	}

	function canStartExternalTracking(objUb)
	{
		if (isWorkflowFullyApproved(objUb)) return false;
		return isInternalApprovalComplete(objUb) && !isExternalTrackingStarted(objUb);
	}

	function isWorkflowFullyApproved(objUb)
	{
		if (!objUb) return false;
		return String(objUb.status || '').toUpperCase() === 'APPROVED';
	}

	function canRecordExternalUpdate(objUb)
	{
		return isExternalTrackingStarted(objUb) &&
			String(objUb.status || '').toUpperCase() === 'PENDING' &&
			!isWorkflowFullyApproved(objUb);
	}

	function getExternalWorkflowStages()
	{
		return UNIFIED_WORKFLOW_STAGES.filter(function(objStage)
		{
			return EXTERNAL_WORKFLOW_TYPES[String(objStage.type || '').toLowerCase()];
		});
	}

	function getDefaultExternalStageKey(objUb)
	{
		var intCurrentIdx = resolveCurrentStageIndex(objUb.currentStage);
		var arrExternal = getExternalWorkflowStages();
		var objMatch = arrExternal.find(function(objStage)
		{
			return resolveCurrentStageIndex(objStage.title) === intCurrentIdx;
		});
		if (objMatch) return objMatch.stepKey;
		return arrExternal.length > 0 ? arrExternal[0].stepKey : '';
	}

	function getStageTitleByKey(strStageKey)
	{
		var objStage = UNIFIED_WORKFLOW_STAGES.find(function(s) { return s.stepKey === strStageKey; });
		return objStage ? objStage.title : strStageKey;
	}

	function getNextStageTitle(strCurrentTitle)
	{
		var intIdx = UNIFIED_WORKFLOW_STAGES.findIndex(function(s) { return s.title === strCurrentTitle; });
		if (intIdx < 0 || intIdx >= UNIFIED_WORKFLOW_STAGES.length - 1) return null;
		return UNIFIED_WORKFLOW_STAGES[intIdx + 1].title;
	}

	function isUbEditable()
	{
		return state.detailMode !== 'view' ||
			state.workingUb.status === 'DRAFT' ||
			state.workingUb.status === 'REJECTED';
	}

	//this function checks whether an active unified budget can still be cancelled
	function canCancelUnifiedBudget(objUb)
	{
		var strStatus = String((objUb && objUb.status) || '').toUpperCase();

		return strStatus === 'DRAFT' ||
			strStatus === 'PENDING' ||
			strStatus === 'REJECTED';
	}

	//this function checks whether the submitted unified budget awaits internal approval
	function canApproveInternalStages(objUb)
	{
		return objUb &&
			String(objUb.status || '').toUpperCase() === 'PENDING' &&
			!isInternalApprovalComplete(objUb);
	}

	function renderActorMeta(strActorLabel, strBy, strAt)
	{
		if (!strBy && !strAt) return '';
		var strParts = [];
		if (strBy) strParts.push(strActorLabel + ' ' + strBy);
		if (strAt) strParts.push(formatTimestamp(strAt));
		return '<div class="br-attachment-card__meta mt-1">' + escapeHtml(strParts.join(' · ')) + '</div>';
	}

	function hasAttachedFiles(objUb)
	{
		return (objUb.attachedFiles || []).length > 0;
	}

	function hasJustification(objUb)
	{
		return (objUb.justificationPosts || []).length > 0;
	}

	function isAttachmentsStepComplete(objUb)
	{
		return hasAttachedFiles(objUb) || hasJustification(objUb);
	}

	function normalizeUbStatus(strStatus)
	{
		return String(strStatus || 'draft').toLowerCase().trim();
	}

	function getUbReturnReason()
	{
		var arrHistory = (state.workingUb.approvalHistory || []).slice().reverse();
		var objReject = arrHistory.find(function(objEntry)
		{
			return String(objEntry.action || '').toLowerCase().indexOf('reject') >= 0;
		});

		if (!objReject)
		{
			return 'For Revision';
		}

		var strReasonText = String(objReject.reason || objReject.remark || '').toLowerCase();
		if (strReasonText.indexOf('clarification') >= 0)
		{
			return 'For Clarification';
		}

		return 'For Revision';
	}

	function renderReadOnlyBannerUb()
	{
		if (!state.workingUb)
		{
			return '';
		}

		var strStatus = normalizeUbStatus(state.workingUb.status);
		var strModifier = '';
		var strMessage = '';

		if (strStatus === 'draft')
		{
			return '';
		}

		if (strStatus === 'rejected')
		{
			strModifier = ' br-readonly-banner--returned';
			if (getUbReturnReason() === 'For Clarification')
			{
				strMessage = 'This unified budget is return for clarification. please input justification.';
			}
			else
			{
				strMessage = 'This unified budget is return for revision. please correct request and resubmit.';
			}
		}
		else if (strStatus === 'approved')
		{
			strModifier = ' br-readonly-banner--reviewed';
			strMessage = 'This unified budget is approved successfully. Approved packages cannot be edited.';
		}
		else if (strStatus === 'pending')
		{
			strModifier = ' br-readonly-banner--pending';
			strMessage = 'This unified budget is pending for review. Submitted and resubmitted packages cannot be edited until they are returned.';
		}
		else
		{
			strModifier = ' br-readonly-banner--pending';
			strMessage = 'This unified budget is pending for review. Submitted and resubmitted packages cannot be edited until they are returned.';
		}

		return '<div class="br-readonly-banner' + strModifier + '">' + escapeHtml(strMessage) + '</div>';
	}

	function wrapWizardStepWithBannerUb(strStepHtml)
	{
		return renderReadOnlyBannerUb() + strStepHtml;
	}

	function renderAttachedFilesSection()
	{
		var objUb = state.workingUb;
		var blnEditable = isUbEditable();
		var strHtml = '<div class="br-card mb-4">' +
			'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">Attached Files</span>';

		if (blnEditable)
		{
			strHtml += '<div class="d-flex align-items-center gap-2 mb-3">' +
				PrototypeUi.renderAddButton('Add File', { id: 'btn-add-attachment-file' }) +
				'<span class="text-muted small">Choose supporting documents from your device.</span>' +
				'<input type="file" class="visually-hidden" id="ub-attachment-file-input" multiple>' +
			'</div>';
		}

		if (!hasAttachedFiles(objUb))
		{
			strHtml += '<p class="text-muted small mb-0">No files attached.</p>';
		}
		else
		{
			objUb.attachedFiles.forEach(function(objFile)
			{
				strHtml += '<div class="br-attachment-card">' +
					'<div class="d-flex justify-content-between align-items-start gap-2">' +
						'<div>' +
							'<div class="br-attachment-card__name">' + escapeHtml(objFile.name) + '</div>' +
							'<div class="br-attachment-card__meta">' + escapeHtml(formatFileSize(objFile.size)) +
								(objFile.type ? ' · ' + escapeHtml(objFile.type) : '') + '</div>' +
							renderActorMeta('Uploaded by', objFile.uploadedBy, objFile.uploadedAt) +
						'</div>';
				if (blnEditable)
				{
					strHtml += PrototypeUi.renderTrashButton('Remove file', { 'data-detach-file': objFile.id });
				}
				strHtml += '</div></div>';
			});
		}

		strHtml += '</div>';
		return strHtml;
	}

	function renderJustificationPostsList(arrPosts)
	{
		if (!arrPosts.length)
		{
			return '<p class="text-muted small mb-0">No justification posted yet.</p>';
		}

		return arrPosts.map(function(objPost)
		{
			return '<div class="br-justification-post">' +
				'<div class="br-justification-post__text">' + escapeHtml(objPost.text) + '</div>' +
				renderActorMeta('Posted by', objPost.postedBy, objPost.postedAt) +
			'</div>';
		}).join('');
	}

	function renderJustificationSection()
	{
		var objUb = state.workingUb;
		var blnEditable = isUbEditable();
		var strHtml = '<div class="br-card">' +
			'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">Justification</span>' +
			'<p class="text-muted small mb-3">Provide legal and practical considerations supporting this unified budget package.</p>';

		if (blnEditable)
		{
			var blnCanPost = String(state.justificationDraft || '').trim() !== '';
			strHtml += '<textarea class="form-control" id="ub-justification" rows="5" maxlength="2000" placeholder="Enter justification">' +
				escapeHtml(state.justificationDraft || '') + '</textarea>' +
				'<div class="d-flex justify-content-end mt-2 mb-4">' +
					'<button type="button" class="btn btn-sm btn-primary" id="btn-post-justification"' +
						(blnCanPost ? '' : ' disabled') + '>Post</button>' +
				'</div>';
		}

		if (objUb.justificationPosts.length > 0)
		{
			if (blnEditable)
			{
				strHtml += '<span class="fw-semibold small d-block mb-2">Posted Justifications</span>';
			}
			strHtml += renderJustificationPostsList(objUb.justificationPosts);
		}
		else if (!blnEditable)
		{
			strHtml += '<p class="text-muted small mb-0">No justification posted.</p>';
		}

		strHtml += '</div>';
		return strHtml;
	}

	function renderAttachedFilesReviewList(objUb)
	{
		if (!hasAttachedFiles(objUb)) return '<p class="mb-0">None</p>';
		return objUb.attachedFiles.map(function(objFile)
		{
			return '<div class="mb-2">' +
				'<div class="fw-semibold">' + escapeHtml(objFile.name) + '</div>' +
				'<div class="text-muted small">' + escapeHtml(formatFileSize(objFile.size)) +
					(objFile.type ? ' · ' + escapeHtml(objFile.type) : '') + '</div>' +
				renderActorMeta('Uploaded by', objFile.uploadedBy, objFile.uploadedAt) +
			'</div>';
		}).join('');
	}

	function postJustification()
	{
		if (!isUbEditable()) return;

		var strDraft = String(state.justificationDraft || '').trim();
		if (!strDraft)
		{
			window.alert('Please enter justification before posting.');
			return;
		}

		ensureUbAttachments(state.workingUb);
		state.workingUb.justificationPosts.push({
			id: 'just-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
			text: strDraft,
			postedAt: getCurrentTimestampIso(),
			postedBy: CURRENT_ACTOR_NAME
		});
		state.justificationDraft = '';
		renderDetailPage();
	}

	function getStatusBadgeClass(strStatus)
	{
		var strNorm = String(strStatus || '').trim().toUpperCase();
		if (strNorm === 'DRAFT') return 'status-badge--draft';
		if (strNorm === 'PENDING') return 'status-badge--pending';
		if (strNorm === 'APPROVED' || strNorm === 'COMPLETED' || strNorm === 'SUBMITTED') return 'status-badge--approved';
		if (strNorm === 'REJECTED') return 'status-badge--rejected';
		if (strNorm === 'CANCELLED') return 'status-badge--cancelled';
		return 'status-badge--draft';
	}

	function getDisplayStatus(strStatus)
	{
		var strNorm = String(strStatus || '').trim().toUpperCase();
		if (strNorm === 'DRAFT') return 'Draft';
		if (strNorm === 'PENDING') return 'Pending';
		if (strNorm === 'APPROVED') return 'Approved';
		if (strNorm === 'REJECTED') return 'Rejected';
		if (strNorm === 'SUBMITTED') return 'Submitted';
		if (strNorm === 'CANCELLED') return 'Cancelled';
		return strStatus;
	}

	function getRequestById(strId)
	{
		return ELIGIBLE_BUDGET_REQUESTS.find(function(r) { return r.id === strId; }) || null;
	}

	function getIncludedRequests(objUb)
	{
		return (objUb.includedRequestIds || []).map(getRequestById).filter(Boolean);
	}

	function computeUbGrandTotal(objUb)
	{
		return getIncludedRequests(objUb).reduce(function(dblSum, objReq)
		{
			return dblSum + objReq.grandTotal;
		}, 0);
	}

	function computeUbTotals(objUb)
	{
		var objTotals = { PS: 0, MOOE: 0, CO: 0, grand: 0 };
		getIncludedRequests(objUb).forEach(function(objReq)
		{
			(objReq.lines || []).forEach(function(objLine)
			{
				var strAllotment = String(objLine.allotment || '').toUpperCase();
				var dblAmount = Number(objLine.amount) || 0;
				if (objTotals[strAllotment] !== undefined)
				{
					objTotals[strAllotment] += dblAmount;
				}
				objTotals.grand += dblAmount;
			});
		});
		return objTotals;
	}

	function createEmptyAmounts()
	{
		return { PS: 0, MOOE: 0, CO: 0 };
	}

	function addToAmounts(objTarget, objSource)
	{
		ALLOTMENT_CASES.forEach(function(strCase)
		{
			objTarget[strCase] += Number(objSource[strCase]) || 0;
		});
	}

	function buildConsolidationTableModel(objUb)
	{
		var objByPillar = {};

		getIncludedRequests(objUb).forEach(function(objReq)
		{
			(objReq.lines || []).forEach(function(objLine)
			{
				var strPillar = objLine.pillar;
				var strCategory = objReq.agencyCategory;
				var strAllotment = String(objLine.allotment || '').toUpperCase();
				var dblAmount = Number(objLine.amount) || 0;

				if (!objByPillar[strPillar])
				{
					objByPillar[strPillar] = { categories: {} };
				}

				if (!objByPillar[strPillar].categories[strCategory])
				{
					objByPillar[strPillar].categories[strCategory] = { agencies: {} };
				}

				if (!objByPillar[strPillar].categories[strCategory].agencies[objReq.id])
				{
					objByPillar[strPillar].categories[strCategory].agencies[objReq.id] = {
						request: objReq,
						amounts: createEmptyAmounts()
					};
				}

				var objAgency = objByPillar[strPillar].categories[strCategory].agencies[objReq.id];
				if (objAgency.amounts[strAllotment] !== undefined)
				{
					objAgency.amounts[strAllotment] += dblAmount;
				}
			});
		});

		return Object.keys(objByPillar).sort().map(function(strPillar)
		{
			var objPillarData = objByPillar[strPillar];
			var arrCategories = Object.keys(objPillarData.categories).sort().map(function(strCategory)
			{
				var objCategoryData = objPillarData.categories[strCategory];
				var arrAgencies = Object.keys(objCategoryData.agencies).map(function(strAgencyId)
				{
					return objCategoryData.agencies[strAgencyId];
				});

				arrAgencies.sort(function(objA, objB)
				{
					return String(objA.request.requestingUnit).localeCompare(String(objB.request.requestingUnit));
				});

				var objCategoryTotals = createEmptyAmounts();
				arrAgencies.forEach(function(objAgency)
				{
					addToAmounts(objCategoryTotals, objAgency.amounts);
				});

				return {
					category: strCategory,
					agencies: arrAgencies,
					totals: objCategoryTotals
				};
			});

			var objPillarTotals = createEmptyAmounts();
			arrCategories.forEach(function(objCategory)
			{
				addToAmounts(objPillarTotals, objCategory.totals);
			});

			return {
				pillar: strPillar,
				categories: arrCategories,
				totals: objPillarTotals
			};
		});
	}

	function isConsolidationExpanded(strKey)
	{
		if (state.consolidationExpanded[strKey] === undefined) return true;
		return state.consolidationExpanded[strKey] === true;
	}

	function renderConsolidationAmountCells(objAmounts, blnShowDash)
	{
		return ALLOTMENT_CASES.map(function(strCase)
		{
			var strCell = blnShowDash
				? formatConsolidationAmountCell(objAmounts[strCase])
				: formatCurrency(objAmounts[strCase] || 0);
			var strClass = 'text-end consolidation-table__col-' + strCase.toLowerCase();
			return '<td class="' + strClass + '">' + strCell + '</td>';
		}).join('');
	}

	function formatConsolidationAmountCell(dblAmount)
	{
		var dblValue = Number(dblAmount) || 0;
		if (dblValue <= 0)
		{
			return '<span class="consolidation-table__empty">—</span>';
		}
		return formatCurrency(dblValue);
	}

	function isVersioningVisible()
	{
		return state.workingUb && (state.workingUb.versions || []).length > 0;
	}

	function isApprovalHistoryVisible()
	{
		return state.workingUb && (state.workingUb.approvalHistory || []).length > 0;
	}

	function isExternalTrackingStepVisible()
	{
		return state.workingUb && isExternalTrackingVisible(state.workingUb);
	}

	function isUnifiedBudgetTabMode()
	{
		if (!state.workingUb) return false;
		return String(state.workingUb.status || 'DRAFT').toUpperCase() !== 'DRAFT';
	}

	function getUnifiedBudgetStepDefinitions()
	{
		return [
			{ id: WIZARD_STEP_GENERAL, wizardLabel: '1. General Information', tabLabel: 'General Information' },
			{ id: WIZARD_STEP_CONSOLIDATION, wizardLabel: '2. Consolidation', tabLabel: 'Consolidation' },
			{ id: WIZARD_STEP_ATTACHMENTS, wizardLabel: '3. Attachments & Justification', tabLabel: 'Attachments & Justification' },
			{ id: WIZARD_STEP_REVIEW, wizardLabel: '4. Review & Submit', tabLabel: 'Review & Submit' },
			{ id: WIZARD_STEP_APPROVAL_HISTORY, wizardLabel: '5. Approval History', tabLabel: 'Approval History', hidden: !isApprovalHistoryVisible() },
			{ id: WIZARD_STEP_VERSION, wizardLabel: '6. Version', tabLabel: 'Version', hidden: !isVersioningVisible() },
			{ id: WIZARD_STEP_EXTERNAL_TRACKING, wizardLabel: '7. External Tracking', tabLabel: 'External Tracking', hidden: !isExternalTrackingStepVisible() }
		];
	}

	function getUniqueAgencyCount(objUb)
	{
		var objSeen = {};
		getIncludedRequests(objUb).forEach(function(objReq)
		{
			objSeen[objReq.requestingUnit] = true;
		});
		return Object.keys(objSeen).length;
	}

	function buildPillarReviewSummary(objUb)
	{
		var objByPillar = {};
		getIncludedRequests(objUb).forEach(function(objReq)
		{
			(objReq.lines || []).forEach(function(objLine)
			{
				var strPillar = objLine.pillar;
				var strAllotment = String(objLine.allotment || '').toUpperCase();
				var dblAmount = Number(objLine.amount) || 0;
				if (!objByPillar[strPillar]) objByPillar[strPillar] = { PS: 0, MOOE: 0, CO: 0, grand: 0 };
				if (objByPillar[strPillar][strAllotment] !== undefined)
				{
					objByPillar[strPillar][strAllotment] += dblAmount;
				}
				objByPillar[strPillar].grand += dblAmount;
			});
		});
		return objByPillar;
	}

	function buildPillarAgencyConsolidationModel(arrRequests)
	{
		var objByPillar = {};

		(arrRequests || []).forEach(function(objReq)
		{
			(objReq.lines || []).forEach(function(objLine)
			{
				var strPillar = objLine.pillar;
				var strAllotment = String(objLine.allotment || '').toUpperCase();
				var dblAmount = Number(objLine.amount) || 0;

				if (!objByPillar[strPillar])
				{
					objByPillar[strPillar] = { agencies: {} };
				}

				if (!objByPillar[strPillar].agencies[objReq.id])
				{
					objByPillar[strPillar].agencies[objReq.id] = {
						id: objReq.id,
						requestingUnit: objReq.requestingUnit,
						referenceNo: objReq.referenceNo,
						amounts: createEmptyAmounts()
					};
				}

				var objAgency = objByPillar[strPillar].agencies[objReq.id];
				if (objAgency.amounts[strAllotment] !== undefined)
				{
					objAgency.amounts[strAllotment] += dblAmount;
				}
			});
		});

		return Object.keys(objByPillar).sort().map(function(strPillar)
		{
			var arrAgencies = Object.keys(objByPillar[strPillar].agencies).map(function(strAgencyId)
			{
				return objByPillar[strPillar].agencies[strAgencyId];
			});

			arrAgencies.sort(function(objA, objB)
			{
				return String(objA.requestingUnit).localeCompare(String(objB.requestingUnit));
			});

			var objPillarTotals = createEmptyAmounts();
			arrAgencies.forEach(function(objAgency)
			{
				addToAmounts(objPillarTotals, objAgency.amounts);
			});

			return {
				pillar: strPillar,
				agencies: arrAgencies,
				totals: objPillarTotals
			};
		});
	}

	function buildVersionSnapshot(objUb)
	{
		var arrRequests = getIncludedRequests(objUb).map(function(objReq)
		{
			return {
				id: objReq.id,
				referenceNo: objReq.referenceNo,
				requestingUnit: objReq.requestingUnit,
				lines: JSON.parse(JSON.stringify(objReq.lines))
			};
		});

		return {
			general: {
				title: objUb.title,
				description: objUb.description,
				fiscalYear: objUb.fiscalYear,
				requestCount: (objUb.includedRequestIds || []).length
			},
			consolidation: buildPillarAgencyConsolidationModel(arrRequests),
			totals: computeUbTotals(objUb),
			attachedFiles: JSON.parse(JSON.stringify(objUb.attachedFiles || [])),
			justificationPosts: JSON.parse(JSON.stringify(objUb.justificationPosts || []))
		};
	}

	function getVersionConsolidationFromSnapshot(objSnapshot)
	{
		if (Array.isArray(objSnapshot.consolidation) && objSnapshot.consolidation.length > 0)
		{
			return objSnapshot.consolidation;
		}

		if (Array.isArray(objSnapshot.requests) && objSnapshot.requests.length > 0)
		{
			return buildPillarAgencyConsolidationModel(objSnapshot.requests);
		}

		return [];
	}

	function getCurrentUbFromStore()
	{
		return UNIFIED_BUDGETS.find(function(u) { return u.id === state.selectedUbId; }) || null;
	}

	function syncWorkingUbToStore()
	{
		var intIdx = UNIFIED_BUDGETS.findIndex(function(u) { return u.id === state.workingUb.id; });
		if (intIdx >= 0)
		{
			UNIFIED_BUDGETS[intIdx] = JSON.parse(JSON.stringify(state.workingUb));
		}
		else
		{
			UNIFIED_BUDGETS.unshift(JSON.parse(JSON.stringify(state.workingUb)));
		}
	}

	function resolveCurrentStageIndex(strCurrentStage)
	{
		var strNorm = String(strCurrentStage || '').trim();
		if (strNorm === 'Finance / Planning Director')
		{
			return UNIFIED_WORKFLOW_STAGES.findIndex(function(s) { return s.title === 'Finance Director'; });
		}
		var intIdx = UNIFIED_WORKFLOW_STAGES.findIndex(function(s) { return s.title === strNorm; });
		return intIdx >= 0 ? intIdx : 0;
	}

	function splitWorkflowStepsByLane(arrSteps)
	{
		var arrInternal = [];
		var arrExternal = [];
		arrSteps.forEach(function(objStep)
		{
			if (EXTERNAL_WORKFLOW_TYPES[String(objStep.type || '').toLowerCase()])
			{
				arrExternal.push(objStep);
			}
			else
			{
				arrInternal.push(objStep);
			}
		});
		return { internalSteps: arrInternal, externalSteps: arrExternal };
	}

	function buildWorkflowSteps()
	{
		var objUb = state.workingUb;
		var strStatus = String(objUb.status || 'DRAFT').toUpperCase();
		var intCurrentIdx = resolveCurrentStageIndex(objUb.currentStage);
		var blnExtStarted = isExternalTrackingStarted(objUb);
		var intFirstExtIdx = getFirstExternalStageIndex();

		return UNIFIED_WORKFLOW_STAGES.map(function(objStage, intIndex)
		{
			var strStepStatus = 'locked';
			var strStatusText = '';
			var strActionAt = '';
			var strActorRole = objStage.actorRole;
			var blnIsExternal = EXTERNAL_WORKFLOW_TYPES[String(objStage.type || '').toLowerCase()];

			if (strStatus === 'CANCELLED')
			{
				if (intIndex === intCurrentIdx)
				{
					strStepStatus = 'rejected';
					strStatusText = 'Unified budget cancelled';
				}
			}
			else if (strStatus === 'DRAFT')
			{
				if (intIndex === 0)
				{
					strStepStatus = 'current';
					strStatusText = 'Draft in progress';
					strActorRole = 'Budget Division · PDO';
				}
			}
			else if (strStatus === 'APPROVED')
			{
				strStepStatus = 'done';
				strStatusText = 'Completed';
			}
			else if (strStatus === 'REJECTED')
			{
				if (intIndex < intCurrentIdx)
				{
					strStepStatus = 'done';
					strStatusText = 'Completed';
				}
				else if (intIndex === intCurrentIdx)
				{
					strStepStatus = 'rejected';
					strStatusText = 'Returned for revision';
					if (objUb.submittedAt) strActionAt = objUb.submittedAt;
				}
			}
			else if (strStatus === 'PENDING')
			{
				if (blnIsExternal && isInternalApprovalComplete(objUb) && !blnExtStarted)
				{
					strStepStatus = 'locked';
					strStatusText = intIndex === intFirstExtIdx ? 'Awaiting external tracking start' : '';
				}
				else if (intIndex < intCurrentIdx)
				{
					strStepStatus = 'done';
					strStatusText = 'Completed';
				}
				else if (intIndex === intCurrentIdx)
				{
					strStepStatus = 'current';
					strStatusText = 'Pending review';
					if (objUb.submittedAt) strActionAt = objUb.submittedAt;
				}
			}

			return {
				stepKey: objStage.stepKey,
				title: objStage.title,
				type: objStage.type,
				status: strStepStatus,
				statusText: strStatusText,
				actionAt: strActionAt,
				actorRole: strActorRole
			};
		});
	}

	function renderWorkflowNodeIcon(strStatus)
	{
		if (strStatus === 'done') return '✓';
		if (strStatus === 'current') return '◷';
		if (strStatus === 'rejected') return '✕';
		return '🔒';
	}

	function renderWorkflowTimelineSteps(arrSteps)
	{
		if (!arrSteps || arrSteps.length === 0)
		{
			return '<p class="text-muted small mb-0">None</p>';
		}

		var strHtml = '';
		arrSteps.forEach(function(objStep, intIndex)
		{
			var strNodeClass = 'workflow-node-' + objStep.status;
			var strConnectorClass = objStep.status === 'done' ? 'workflow-connector-done' : 'workflow-connector-locked';
			strHtml += '<div class="d-flex align-items-start gap-3">';
			strHtml += '<div class="workflow-stack">';
			strHtml += '<div class="workflow-node ' + strNodeClass + '">' + renderWorkflowNodeIcon(objStep.status) + '</div>';
			if (intIndex < arrSteps.length - 1)
			{
				strHtml += '<div class="workflow-connector ' + strConnectorClass + '"></div>';
			}
			strHtml += '</div><div class="mb-3">';
			strHtml += '<p class="mb-0 fw-semibold workflow-title">' + escapeHtml(objStep.title) + '</p>';
			if (objStep.statusText) strHtml += '<p class="workflow-status text-muted mb-0">' + escapeHtml(objStep.statusText) + '</p>';
			if (objStep.actionAt) strHtml += '<p class="text-muted mb-0 workflow-meta">' + escapeHtml(objStep.actionAt) + '</p>';
			if (objStep.actorRole) strHtml += '<p class="text-muted mb-0 workflow-actor">' + escapeHtml(objStep.actorRole) + '</p>';
			strHtml += '</div></div>';
		});
		return strHtml;
	}

	function renderExternalWorkflowTimelineHorizontal(arrSteps)
	{
		if (!arrSteps || arrSteps.length === 0)
		{
			return '<p class="text-muted small mb-0">None</p>';
		}

		var strHtml = '<div class="workflow-timeline-h">';
		arrSteps.forEach(function(objStep, intIndex)
		{
			var strNodeClass = 'workflow-node-' + objStep.status;
			var blnPrevDone = (intIndex === 0) || (arrSteps[intIndex - 1].status === 'done');
			var blnLineAfterDone = objStep.status === 'done';
			var strLineBeforeClass = 'workflow-timeline-h__line';
			var strLineAfterClass = 'workflow-timeline-h__line';

			if (intIndex === 0)
			{
				strLineBeforeClass += ' workflow-timeline-h__line--spacer';
			}
			else if (blnPrevDone)
			{
				strLineBeforeClass += ' workflow-timeline-h__line--done';
			}

			if (intIndex === arrSteps.length - 1)
			{
				strLineAfterClass += ' workflow-timeline-h__line--spacer';
			}
			else if (blnLineAfterDone)
			{
				strLineAfterClass += ' workflow-timeline-h__line--done';
			}

			strHtml += '<div class="workflow-timeline-h__item">';
			strHtml += '<div class="workflow-timeline-h__rail">';
			strHtml += '<span class="' + strLineBeforeClass + '" aria-hidden="true"></span>';
			strHtml += '<div class="workflow-node ' + strNodeClass + '">' + renderWorkflowNodeIcon(objStep.status) + '</div>';
			strHtml += '<span class="' + strLineAfterClass + '" aria-hidden="true"></span>';
			strHtml += '</div>';
			strHtml += '<div class="workflow-timeline-h__body">';
			strHtml += '<p class="mb-0 fw-semibold workflow-title">' + escapeHtml(objStep.title) + '</p>';
			if (objStep.statusText)
			{
				strHtml += '<p class="workflow-status text-muted mb-0">' + escapeHtml(objStep.statusText) + '</p>';
			}
			if (objStep.actionAt)
			{
				strHtml += '<p class="text-muted mb-0 workflow-meta">' + escapeHtml(objStep.actionAt) + '</p>';
			}
			if (objStep.actorRole)
			{
				strHtml += '<p class="text-muted mb-0 workflow-actor">' + escapeHtml(objStep.actorRole) + '</p>';
			}
			strHtml += '</div></div>';
		});
		strHtml += '</div>';
		return strHtml;
	}

	function renderWorkflowPanel()
	{
		var objLanes = splitWorkflowStepsByLane(buildWorkflowSteps());
		var strHtml = '<div class="br-card"><p class="fw-bold text-uppercase section-eyebrow mb-3">Approval Workflow</p>';

		if (objLanes.internalSteps.length === 0 && objLanes.externalSteps.length === 0)
		{
			strHtml += '<p class="text-muted small mb-0">No workflow steps yet.</p></div>';
			return strHtml;
		}

		strHtml += '<p class="fw-semibold small text-uppercase text-muted mt-2 mb-2">Internal stages</p>';
		strHtml += renderWorkflowTimelineSteps(objLanes.internalSteps);
		strHtml += '<p class="fw-semibold small text-uppercase text-muted mt-3 mb-2">External stages</p>';
		strHtml += renderWorkflowTimelineSteps(objLanes.externalSteps);
		strHtml += '</div>';
		return strHtml;
	}

	function renderSummaryPanel(strTitle)
	{
		var objTotals = computeUbTotals(state.workingUb);
		return '<div class="br-card">' +
			'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">' + escapeHtml(strTitle || 'Unified Budget Summary') + '</span>' +
			'<div class="d-flex justify-content-between small mb-1"><span class="allotment-group--ps">PS</span><span>' + formatCurrency(objTotals.PS) + '</span></div>' +
			'<div class="d-flex justify-content-between small mb-1"><span class="allotment-group--mooe">MOOE</span><span>' + formatCurrency(objTotals.MOOE) + '</span></div>' +
			'<div class="d-flex justify-content-between small mb-2"><span class="allotment-group--co">CO</span><span>' + formatCurrency(objTotals.CO) + '</span></div>' +
			'<div class="d-flex justify-content-between fw-bold border-top pt-2"><span>Grand Total</span><span>' + formatCurrency(objTotals.grand) + '</span></div>' +
		'</div>';
	}

	function renderConsolidationTable()
	{
		var arrPillars = buildConsolidationTableModel(state.workingUb);

		if (arrPillars.length === 0)
		{
			return '<p class="text-muted mb-0">No budget requests included. Use Consolidate Budget to add eligible requests.</p>';
		}

		var objGrandTotals = createEmptyAmounts();
		var strBodyRows = '';

		arrPillars.forEach(function(objPillar)
		{
			var strPillarKey = 'pillar:' + objPillar.pillar;
			var blnPillarOpen = isConsolidationExpanded(strPillarKey);
			addToAmounts(objGrandTotals, objPillar.totals);

			strBodyRows += '<tr class="consolidation-table__pillar-row">' +
				'<td class="consolidation-table__label--pillar">' +
					'<button type="button" class="consolidation-table__group-toggle" data-toggle-consolidation="' + escapeHtml(strPillarKey) + '">' +
						escapeHtml(objPillar.pillar) + (blnPillarOpen ? ' ▾' : ' ▸') +
					'</button>' +
				'</td>' +
				renderConsolidationAmountCells(objPillar.totals, false) +
			'</tr>';

			if (!blnPillarOpen) return;

			objPillar.categories.forEach(function(objCategory)
			{
				var strCategoryKey = strPillarKey + '|cat:' + objCategory.category;
				var blnCategoryOpen = isConsolidationExpanded(strCategoryKey);

				strBodyRows += '<tr class="consolidation-table__group-row">' +
					'<td class="consolidation-table__label--category">' +
						'<button type="button" class="consolidation-table__group-toggle" data-toggle-consolidation="' + escapeHtml(strCategoryKey) + '">' +
							escapeHtml(objCategory.category) + (blnCategoryOpen ? ' ▾' : ' ▸') +
						'</button>' +
					'</td>' +
					renderConsolidationAmountCells(objCategory.totals, false) +
				'</tr>';

				if (!blnCategoryOpen) return;

				objCategory.agencies.forEach(function(objAgency)
				{
					var objReq = objAgency.request;
					strBodyRows += '<tr class="consolidation-table__agency-row">' +
						'<td class="consolidation-table__label--agency consolidation-table__agency-cell">' +
							'<a href="budget_request_detail.html" target="_blank" rel="noopener" title="Open budget request">' + escapeHtml(objReq.requestingUnit) + '</a>' +
							'<span class="consolidation-table__agency-ref">' + escapeHtml(objReq.referenceNo) + '</span>' +
						'</td>' +
						renderConsolidationAmountCells(objAgency.amounts, true) +
					'</tr>';
				});
			});
		});

		return '<div class="br-table-wrap">' +
			'<table class="consolidation-table">' +
				'<thead><tr>' +
					'<th>Pillar / Agency Category / Agency</th>' +
					'<th class="text-end consolidation-table__col-ps">PS</th>' +
					'<th class="text-end consolidation-table__col-mooe">MOOE</th>' +
					'<th class="text-end consolidation-table__col-co">CO</th>' +
				'</tr></thead>' +
				'<tbody>' + strBodyRows + '</tbody>' +
				'<tfoot>' +
					'<tr class="consolidation-table__grand-row">' +
						'<td>Grand Total</td>' +
						'<td class="text-end consolidation-table__col-ps">' + formatCurrency(objGrandTotals.PS) + '</td>' +
						'<td class="text-end consolidation-table__col-mooe">' + formatCurrency(objGrandTotals.MOOE) + '</td>' +
						'<td class="text-end consolidation-table__col-co">' + formatCurrency(objGrandTotals.CO) + '</td>' +
					'</tr>' +
				'</tfoot>' +
			'</table>' +
		'</div>';
	}

	function renderStepGeneral()
	{
		var intRequestCount = (state.workingUb.includedRequestIds || []).length;
		var blnReadonly = state.detailMode === 'view' && state.workingUb.status !== 'DRAFT' && state.workingUb.status !== 'REJECTED';

		return '<div class="br-card">' +
			'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">General Information</span>' +
			'<div class="mb-3">' +
				'<label class="form-label fw-semibold" for="ub-title">Unified Budget Title</label>' +
				'<input type="text" class="form-control" id="ub-title" maxlength="255" value="' + escapeHtml(state.workingUb.title) + '"' + (blnReadonly ? ' readonly' : '') + '>' +
			'</div>' +
			'<div class="mb-3">' +
				'<label class="form-label fw-semibold" for="ub-description">Description</label>' +
				'<textarea class="form-control" id="ub-description" rows="4" maxlength="2000"' + (blnReadonly ? ' readonly' : '') + '>' + escapeHtml(state.workingUb.description) + '</textarea>' +
			'</div>' +
			'<div class="row g-3">' +
				'<div class="col-md-6">' +
					'<label class="form-label fw-semibold" for="ub-fiscal-year">Fiscal Year</label>' +
					'<select class="form-select" id="ub-fiscal-year"' + (blnReadonly ? ' disabled' : '') + '>' +
						['2026', '2027', '2028'].map(function(strYear)
						{
							var strSel = state.workingUb.fiscalYear === strYear ? ' selected' : '';
							return '<option value="' + strYear + '"' + strSel + '>' + strYear + '</option>';
						}).join('') +
					'</select>' +
				'</div>' +
				'<div class="col-md-6">' +
					'<label class="form-label fw-semibold">Number of Budget Requests Included</label>' +
					'<input type="text" class="form-control" readonly value="' + intRequestCount + '">' +
				'</div>' +
			'</div>' +
		'</div>';
	}

	function renderStepAttachments()
	{
		return renderAttachedFilesSection() +
			renderJustificationSection();
	}

	function renderStepConsolidation()
	{
		var strBody =
			'<div class="ub-wizard-content__main">' +
				'<div class="br-card">' +
					'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">Consolidation</span>' +
					'<p class="text-muted small mb-3">Grouped by pillar, agency category, and agency. Click an agency to open the linked budget request.</p>' +
					renderConsolidationTable() +
				'</div>' +
			'</div>' +
			'<div class="ub-summary-panel">' +
				renderSummaryPanel('Unified Budget Summary') +
				renderWorkflowPanel() +
			'</div>';

		return '<div class="ub-wizard-content__consolidation">' +
			renderReadOnlyBannerUb() +
			'<div class="ub-wizard-content__consolidation-body">' + strBody + '</div>' +
		'</div>';
	}

	function renderReviewBudgetSummaryTable(objUb)
	{
		var objByPillar = buildPillarReviewSummary(objUb);
		var objTotals = computeUbTotals(objUb);
		var arrPillarNames = Object.keys(objByPillar).sort();

		if (arrPillarNames.length === 0)
		{
			return '<p class="text-muted small mb-0">No budget data.</p>';
		}

		var strBodyRows = arrPillarNames.map(function(strPillar)
		{
			var objPillar = objByPillar[strPillar];
			return '<tr>' +
				'<td class="fw-semibold">' + escapeHtml(strPillar) + '</td>' +
				renderConsolidationAmountCells(objPillar, false) +
			'</tr>';
		}).join('');

		return '<div class="br-table-wrap">' +
			'<table class="consolidation-table">' +
				'<thead><tr>' +
					'<th>Pillar</th>' +
					'<th class="text-end consolidation-table__col-ps">PS</th>' +
					'<th class="text-end consolidation-table__col-mooe">MOOE</th>' +
					'<th class="text-end consolidation-table__col-co">CO</th>' +
				'</tr></thead>' +
				'<tbody>' + strBodyRows + '</tbody>' +
				'<tfoot>' +
					'<tr class="consolidation-table__grand-row">' +
						'<td>Grand Total</td>' +
						'<td class="text-end consolidation-table__col-ps">' + formatCurrency(objTotals.PS) + '</td>' +
						'<td class="text-end consolidation-table__col-mooe">' + formatCurrency(objTotals.MOOE) + '</td>' +
						'<td class="text-end consolidation-table__col-co">' + formatCurrency(objTotals.CO) + '</td>' +
					'</tr>' +
				'</tfoot>' +
			'</table>' +
		'</div>';
	}

	function renderStepReview()
	{
		var objUb = state.workingUb;

		return '<div class="br-card mb-4">' +
			'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">Unified Budget Information</span>' +
			'<dl class="row mb-0 small">' +
				'<dt class="col-sm-4">Title</dt><dd class="col-sm-8">' + escapeHtml(objUb.title) + '</dd>' +
				'<dt class="col-sm-4">Fiscal Year</dt><dd class="col-sm-8">' + escapeHtml(objUb.fiscalYear) + '</dd>' +
				'<dt class="col-sm-4">Agency Name</dt><dd class="col-sm-8">DOST</dd>' +
				'<dt class="col-sm-4">Description</dt><dd class="col-sm-8">' + escapeHtml(objUb.description) + '</dd>' +
				'<dt class="col-sm-4">Number of Submitting Agencies</dt><dd class="col-sm-8">' + getUniqueAgencyCount(objUb) + '</dd>' +
			'</dl>' +
		'</div>' +
		'<div class="br-card">' +
			'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">Budget Summary</span>' +
			renderReviewBudgetSummaryTable(objUb) +
		'</div>';
	}

	function isVersionTreeExpanded(intVersionNumber, strKey)
	{
		var strStateKey = 'v' + intVersionNumber + '|' + strKey;
		if (state.versionTreeExpanded[strStateKey] === undefined) return true;
		return state.versionTreeExpanded[strStateKey] === true;
	}

	function renderVersionConsolidationTable(intVersionNumber, objSnapshot)
	{
		var arrPillars = getVersionConsolidationFromSnapshot(objSnapshot);

		if (arrPillars.length === 0)
		{
			return '<p class="text-muted small mb-0">No consolidation data in this version.</p>';
		}

		var strBodyRows = '';

		arrPillars.forEach(function(objPillar)
		{
			var strPillarKey = 'pillar:' + objPillar.pillar;
			var blnPillarOpen = isVersionTreeExpanded(intVersionNumber, strPillarKey);

			strBodyRows += '<tr class="consolidation-table__pillar-row">' +
				'<td class="consolidation-table__label--pillar">' +
					'<button type="button" class="consolidation-table__group-toggle" data-toggle-version-tree data-version-number="' + intVersionNumber + '" data-tree-key="' + escapeHtml(strPillarKey) + '">' +
						escapeHtml(objPillar.pillar) + (blnPillarOpen ? ' ▾' : ' ▸') +
					'</button>' +
				'</td>' +
				renderConsolidationAmountCells(objPillar.totals, false) +
			'</tr>';

			if (!blnPillarOpen) return;

			objPillar.agencies.forEach(function(objAgency)
			{
				strBodyRows += '<tr class="consolidation-table__agency-row">' +
					'<td class="consolidation-table__label--agency consolidation-table__agency-cell">' +
						escapeHtml(objAgency.requestingUnit) +
						'<span class="consolidation-table__agency-ref">' + escapeHtml(objAgency.referenceNo) + '</span>' +
					'</td>' +
					renderConsolidationAmountCells(objAgency.amounts, true) +
				'</tr>';
			});
		});

		return '<div class="br-table-wrap">' +
			'<table class="consolidation-table">' +
				'<thead><tr>' +
					'<th>Pillar / Agency</th>' +
					'<th class="text-end consolidation-table__col-ps">PS</th>' +
					'<th class="text-end consolidation-table__col-mooe">MOOE</th>' +
					'<th class="text-end consolidation-table__col-co">CO</th>' +
				'</tr></thead>' +
				'<tbody>' + strBodyRows + '</tbody>' +
			'</table>' +
		'</div>';
	}

	function renderVersionSnapshot(intVersionNumber, objSnapshot)
	{
		if (!objSnapshot) return '<p class="text-muted small mb-0">No snapshot data.</p>';

		return '<div class="version-snapshot-section"><h6>General Information</h6>' +
			'<p class="small mb-1"><strong>Title:</strong> ' + escapeHtml(objSnapshot.general.title) + '</p>' +
			'<p class="small mb-1"><strong>Fiscal Year:</strong> ' + escapeHtml(objSnapshot.general.fiscalYear) + '</p>' +
			'<p class="small mb-1"><strong>Requests Included:</strong> ' + objSnapshot.general.requestCount + '</p>' +
			'<p class="small mb-0"><strong>Description:</strong> ' + escapeHtml(objSnapshot.general.description) + '</p>' +
		'</div>' +
		'<div class="version-snapshot-section"><h6>Consolidation Summary</h6>' +
			'<p class="text-muted small mb-2">Grouped by pillar, agency, and allotment case (PS, MOOE, CO).</p>' +
			renderVersionConsolidationTable(intVersionNumber, objSnapshot) +
		'</div>' +
		'<div class="border-top pt-3 mt-3">' +
			'<div class="d-flex justify-content-between small"><span>PS</span><span>' + formatCurrency(objSnapshot.totals.PS) + '</span></div>' +
			'<div class="d-flex justify-content-between small"><span>MOOE</span><span>' + formatCurrency(objSnapshot.totals.MOOE) + '</span></div>' +
			'<div class="d-flex justify-content-between small"><span>CO</span><span>' + formatCurrency(objSnapshot.totals.CO) + '</span></div>' +
			'<div class="d-flex justify-content-between fw-bold mt-2"><span>Grand Total</span><span>' + formatCurrency(objSnapshot.totals.grand) + '</span></div>' +
		'</div>' +
		((objSnapshot.attachedFiles || []).length > 0 || (objSnapshot.justificationPosts || []).length > 0 ?
			'<div class="version-snapshot-section"><h6>Attachments & Justification</h6>' +
				'<div class="small fw-semibold mb-2">Attached Files</div>' +
				renderAttachedFilesReviewList({ attachedFiles: objSnapshot.attachedFiles || [] }) +
				'<div class="small fw-semibold mb-2 mt-3">Justification</div>' +
				renderJustificationPostsList(objSnapshot.justificationPosts || []) +
			'</div>' : '');
	}

	function getVersionExpandKey(intVersionNumber)
	{
		return 'version-' + intVersionNumber;
	}

	function isVersionExpanded(intVersionNumber, blnIsLatest)
	{
		var strKey = getVersionExpandKey(intVersionNumber);
		if (state.versionExpanded[strKey] !== undefined)
		{
			return state.versionExpanded[strKey] === true;
		}
		return blnIsLatest === true;
	}

	function renderStepVersion()
	{
		var arrVersions = (state.workingUb.versions || []).slice().sort(function(a, b) { return b.versionNumber - a.versionNumber; });
		if (arrVersions.length === 0)
		{
			return '<div class="br-card"><p class="text-muted mb-0">No versions yet. Submit the unified budget to create the first version snapshot.</p></div>';
		}

		var intLatestVersion = arrVersions[0].versionNumber;

		return '<div class="br-card">' +
			'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">Version History</span>' +
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
				strHtml += '<span class="status-badge ' + getStatusBadgeClass(objVersion.status) + '">' + escapeHtml(getDisplayStatus(objVersion.status)) + '</span>';
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
					strHtml += renderVersionSnapshot(objVersion.versionNumber, objVersion.snapshot);
					strHtml += '</div></div>';
				}

				strHtml += '</div>';
				return strHtml;
			}).join('') +
		'</div>';
	}

	function renderStepApprovalHistory()
	{
		var arrHistory = state.workingUb.approvalHistory || [];
		if (arrHistory.length === 0)
		{
			return '<div class="br-card"><p class="text-muted mb-0">No approval actions recorded yet.</p></div>';
		}

		var strRows = arrHistory.map(function(objEntry)
		{
			return '<tr>' +
				'<td>' + escapeHtml(objEntry.date) + '</td>' +
				'<td>' + escapeHtml(objEntry.user) + '</td>' +
				'<td>' + escapeHtml(objEntry.role) + '</td>' +
				'<td><span class="status-badge status-badge--stage">' + escapeHtml(objEntry.action) + '</span></td>' +
				'<td>' + escapeHtml(objEntry.reason) + '</td>' +
				'<td>' + escapeHtml(objEntry.remark) + '</td>' +
			'</tr>';
		}).join('');

		return '<div class="br-card">' +
			'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">Approval History</span>' +
			'<div class="br-table-wrap">' +
				'<table class="br-table">' +
					'<thead><tr>' +
						'<th>Date</th><th>User</th><th>Role</th><th>Action</th><th>Reason</th><th>Remark</th>' +
					'</tr></thead>' +
					'<tbody>' + strRows + '</tbody>' +
				'</table>' +
			'</div>' +
		'</div>';
	}

	function renderExternalDocumentsList()
	{
		var arrDocs = state.workingUb.externalDocuments || [];
		if (arrDocs.length === 0)
		{
			return '<p class="text-muted small mb-0">No documents uploaded yet.</p>';
		}

		return arrDocs.slice().reverse().map(function(objDoc)
		{
			return '<div class="ub-ext-doc-row">' +
				'<div class="ub-ext-doc-row__icon">📄</div>' +
				'<div class="ub-ext-doc-row__body">' +
					'<div class="fw-semibold">' + escapeHtml(objDoc.name) + '</div>' +
					'<div class="d-flex align-items-center gap-2 flex-wrap mt-1">' +
						(objDoc.stage ? '<span class="ub-ext-stage-badge">' + escapeHtml(objDoc.stage) + '</span>' : '') +
						'<span class="text-muted small">' + escapeHtml(formatFileSize(objDoc.size)) + '</span>' +
						renderActorMeta('Uploaded by', objDoc.uploadedBy, objDoc.uploadedAt) +
					'</div>' +
				'</div>' +
			'</div>';
		}).join('');
	}

	function renderExternalStageHistoryTable()
	{
		var arrHistory = (state.workingUb.externalStageHistory || []).slice().reverse();
		if (arrHistory.length === 0)
		{
			return '<p class="text-muted small mb-0">No external stage decisions recorded yet.</p>';
		}

		var strRows = arrHistory.map(function(objEntry)
		{
			var strDecisionClass = objEntry.decision === 'approved' ? 'status-badge--approved' : 'status-badge--rejected';
			return '<tr>' +
				'<td>' + escapeHtml(formatTimestamp(objEntry.recordedAt)) + '</td>' +
				'<td>' + escapeHtml(objEntry.stageTitle) + '</td>' +
				'<td><span class="status-badge ' + strDecisionClass + '">' + escapeHtml(objEntry.decision) + '</span></td>' +
				'<td>' + escapeHtml(objEntry.recordedBy) + '</td>' +
				'<td>' + escapeHtml(objEntry.remarks || '—') + '</td>' +
			'</tr>';
		}).join('');

		return '<div class="br-table-wrap">' +
			'<table class="br-table">' +
				'<thead><tr><th>Date</th><th>Stage</th><th>Decision</th><th>Recorded By</th><th>Remarks</th></tr></thead>' +
				'<tbody>' + strRows + '</tbody>' +
			'</table>' +
		'</div>';
	}

	function renderExternalStageUpdatePanel()
	{
		var objUb = state.workingUb;
		var blnCanUpdate = canRecordExternalUpdate(objUb);
		var blnFullyApproved = isWorkflowFullyApproved(objUb);
		var arrExternal = getExternalWorkflowStages();
		var strForm = state.externalUpdateForm;
		var strStageOptions = arrExternal.map(function(objStage)
		{
			var strSel = strForm.stageKey === objStage.stepKey ? ' selected' : '';
			return '<option value="' + escapeHtml(objStage.stepKey) + '"' + strSel + '>' + escapeHtml(objStage.title) + '</option>';
		}).join('');

		var strApprovedActive = strForm.decision === 'approved' ? ' btn-primary' : ' btn-outline-secondary';
		var strRejectedActive = strForm.decision === 'rejected' ? ' btn-primary' : ' btn-outline-secondary';

		return '<div class="br-card ub-ext-update-panel">' +
			'<p class="fw-bold mb-1 text-brand">External Stage Update</p>' +
			'<p class="text-muted small mb-3">Record decisions for inter-agency and legislative review stages.</p>' +
			'<div class="mb-3">' +
				'<label class="form-label small fw-semibold text-uppercase text-muted" for="ub-ext-stage">Target Entity</label>' +
				'<select class="form-select" id="ub-ext-stage"' + (blnCanUpdate ? '' : ' disabled') + '>' + strStageOptions + '</select>' +
			'</div>' +
			'<div class="mb-3">' +
				'<label class="form-label small fw-semibold text-uppercase text-muted d-block mb-2">Status Update</label>' +
				'<div class="d-flex gap-2">' +
					'<button type="button" class="btn btn-sm' + strApprovedActive + '" data-ext-decision="approved"' + (blnCanUpdate ? '' : ' disabled') + '>APPROVED</button>' +
					'<button type="button" class="btn btn-sm' + strRejectedActive + '" data-ext-decision="rejected"' + (blnCanUpdate ? '' : ' disabled') + '>REJECTED</button>' +
				'</div>' +
			'</div>' +
			'<div class="mb-3">' +
				'<label class="form-label small fw-semibold text-uppercase text-muted" for="ub-ext-remarks">Official Remarks</label>' +
				'<textarea class="form-control" id="ub-ext-remarks" rows="4" maxlength="2000" placeholder="Enter decision summary..."' + (blnCanUpdate ? '' : ' disabled') + '>' +
					escapeHtml(strForm.remarks) + '</textarea>' +
			'</div>' +
			(blnFullyApproved ?
				'<p class="text-muted small mb-3">All approval stages are complete. Status updates are no longer available.</p>' : '') +
			'<button type="button" class="btn btn-primary w-100 mb-3" id="btn-ext-stage-update"' +
				(blnCanUpdate && strForm.stageKey ? '' : ' disabled') + '>Status Update</button>' +
			'<div class="ub-ext-upload-zone" id="ub-ext-upload-zone">' +
				'<div class="ub-ext-upload-zone__icon">☁</div>' +
				'<p class="fw-semibold mb-1">Upload Revised Documents</p>' +
				'<p class="text-muted small mb-0">Drag and drop files, or click to browse</p>' +
				'<input type="file" class="visually-hidden" id="ub-ext-file-input" multiple' + (blnCanUpdate ? '' : ' disabled') + '>' +
			'</div>' +
		'</div>';
	}

	function renderStepExternalTracking()
	{
		var objUb = state.workingUb;
		var objLanes = splitWorkflowStepsByLane(buildWorkflowSteps());
		var strStartSection = '';

		if (canStartExternalTracking(objUb))
		{
			strStartSection = '<div class="br-card mb-4">' +
				'<span class="fw-bold text-uppercase section-eyebrow d-block mb-2">Ready for External Tracking</span>' +
				'<p class="text-muted small mb-3">Internal approval is complete. Start external tracking to record legislative and executive review decisions for this unified budget.</p>' +
				'<button type="button" class="btn btn-primary" id="btn-start-external-tracking">Start External Tracking</button>' +
			'</div>';
		}
		else if (isExternalTrackingStarted(objUb))
		{
			strStartSection = '<div class="br-card mb-4 ub-ext-started-banner">' +
				'<span class="fw-bold text-uppercase section-eyebrow d-block mb-2">External Tracking Active</span>' +
				'<p class="text-muted small mb-0">Started by ' + escapeHtml(objUb.externalTracking.startedBy || CURRENT_ACTOR_NAME) +
					' · ' + escapeHtml(formatTimestamp(objUb.externalTracking.startedAt)) + '</p>' +
			'</div>';
		}

		var strUpdateColumn = '';
		if (isExternalTrackingStarted(objUb))
		{
			strUpdateColumn = renderExternalStageUpdatePanel();
		}

		return strStartSection +
			'<div class="br-card mb-4">' +
				'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">External Approval Workflow</span>' +
				renderExternalWorkflowTimelineHorizontal(objLanes.externalSteps) +
			'</div>' +
			(isExternalTrackingStarted(objUb) ?
				'<div class="ub-ext-tracking-layout">' +
					strUpdateColumn +
					'<div class="br-card">' +
						'<p class="fw-bold mb-1 text-brand">Document Version History</p>' +
						'<p class="text-muted small mb-3">Audit trail of fiscal revisions and submittals per external stage.</p>' +
						renderExternalDocumentsList() +
						'<hr class="my-4">' +
						'<p class="fw-semibold small text-uppercase text-muted mb-2">Stage Decision Log</p>' +
						renderExternalStageHistoryTable() +
					'</div>' +
				'</div>' : '');
	}

	function startExternalTracking()
	{
		if (!canStartExternalTracking(state.workingUb)) return;

		ensureExternalTracking(state.workingUb);
		state.workingUb.externalTracking.started = true;
		state.workingUb.externalTracking.startedAt = getCurrentTimestampIso();
		state.workingUb.externalTracking.startedBy = CURRENT_ACTOR_NAME;

		if (resolveCurrentStageIndex(state.workingUb.currentStage) <= getSecretaryStageIndex())
		{
			state.workingUb.currentStage = 'DBM';
		}

		state.workingUb.approvalHistory.push({
			date: formatDisplayNow(),
			user: CURRENT_ACTOR_NAME,
			role: 'PDO',
			action: 'Start External Tracking',
			reason: 'Internal approval complete',
			remark: 'External legislative and executive review tracking initiated.'
		});
		state.workingUb.lastUpdated = getCurrentTimestampIso();
		state.externalUpdateForm.stageKey = getDefaultExternalStageKey(state.workingUb);
		syncWorkingUbToStore();
		renderDetailPage();
	}

	function applyExternalStageUpdate()
	{
		if (!canRecordExternalUpdate(state.workingUb)) return;

		var strStageKey = state.externalUpdateForm.stageKey;
		var strDecision = state.externalUpdateForm.decision;
		var strRemarks = String(state.externalUpdateForm.remarks || '').trim();
		var strStageTitle = getStageTitleByKey(strStageKey);

		if (!strStageKey)
		{
			window.alert('Please select a target entity.');
			return;
		}

		if (!strRemarks)
		{
			window.alert('Please enter official remarks for this decision.');
			return;
		}

		ensureExternalTracking(state.workingUb);
		state.workingUb.externalStageHistory.push({
			id: 'ext-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
			stageKey: strStageKey,
			stageTitle: strStageTitle,
			decision: strDecision,
			remarks: strRemarks,
			recordedAt: getCurrentTimestampIso(),
			recordedBy: CURRENT_ACTOR_NAME
		});

		if (strDecision === 'rejected')
		{
			state.workingUb.status = 'REJECTED';
			state.workingUb.currentStage = strStageTitle;
			state.workingUb.approvalHistory.push({
				date: formatDisplayNow(),
				user: CURRENT_ACTOR_NAME,
				role: 'PDO',
				action: 'External Reject',
				reason: strStageTitle,
				remark: strRemarks
			});
		}
		else
		{
			var strNextStage = getNextStageTitle(strStageTitle);
			state.workingUb.approvalHistory.push({
				date: formatDisplayNow(),
				user: CURRENT_ACTOR_NAME,
				role: 'PDO',
				action: 'External Approve',
				reason: strStageTitle,
				remark: strRemarks
			});

			if (!strNextStage || strStageKey === 'president')
			{
				state.workingUb.status = 'APPROVED';
				state.workingUb.currentStage = 'President';
			}
			else
			{
				state.workingUb.currentStage = strNextStage;
				var objNextStage = UNIFIED_WORKFLOW_STAGES.find(function(s) { return s.title === strNextStage; });
				state.externalUpdateForm.stageKey = objNextStage ? objNextStage.stepKey : strStageKey;
			}
		}

		state.workingUb.lastUpdated = getCurrentTimestampIso();
		state.externalUpdateForm.remarks = '';
		syncWorkingUbToStore();
		renderDetailPage();
		window.alert('External stage update recorded.');
	}

	function renderDetailHeader()
	{
		var objUb = state.workingUb;
		elDetailHeader.innerHTML =
			'<div class="ub-detail-header__inner">' +
				'<div class="d-flex justify-content-between align-items-start flex-wrap gap-2">' +
					'<div>' +
						'<h4 class="mb-1 fw-semibold">' + escapeHtml(objUb.title || 'Untitled Unified Budget') + '</h4>' +
						'<p class="text-muted small mb-0">Ref: ' + escapeHtml(objUb.referenceNo || '— (not yet assigned)') + '</p>' +
					'</div>' +
					'<span class="status-badge ' + getStatusBadgeClass(objUb.status) + '">' + escapeHtml(getDisplayStatus(objUb.status)) + '</span>' +
				'</div>' +
			'</div>';
	}

	function renderWizardStepper()
	{
		var blnTabMode = isUnifiedBudgetTabMode();
		var arrSteps = getUnifiedBudgetStepDefinitions();

		elWizardStepper.className = blnTabMode ? 'ub-wizard-stepper ub-wizard-stepper--tabs' : 'ub-wizard-stepper';
		elWizardStepper.setAttribute('aria-label', blnTabMode ? 'Unified budget detail tabs' : 'Unified budget wizard steps');

		if (blnTabMode)
		{
			var strTabHtml = '<div class="ub-detail-tabs" role="tablist">';
			arrSteps.forEach(function(objStep)
			{
				if (objStep.hidden) return;
				var strClasses = 'ub-detail-tabs__btn';
				if (objStep.id === state.wizardStep) strClasses += ' ub-detail-tabs__btn--active';
				strTabHtml += '<button type="button" class="' + strClasses + '" data-wizard-step="' + objStep.id + '" role="tab">' +
					escapeHtml(objStep.tabLabel) + '</button>';
			});
			strTabHtml += '</div>';
			elWizardStepper.innerHTML = strTabHtml;
			return;
		}

		var strHtml = '<ul class="ub-wizard-stepper__list">';
		arrSteps.forEach(function(objStep)
		{
			if (objStep.hidden) return;
			var strClasses = 'ub-wizard-stepper__btn';
			if (objStep.id === state.wizardStep) strClasses += ' ub-wizard-stepper__btn--active';
			strHtml += '<li><button type="button" class="' + strClasses + '" data-wizard-step="' + objStep.id + '">' + escapeHtml(objStep.wizardLabel) + '</button></li>';
		});
		strHtml += '</ul>';
		elWizardStepper.innerHTML = strHtml;
	}

	function renderFooterActionsTabMode()
	{
		var strHtml = '';
		var blnEditable = isUbEditable();

		if (canCancelUnifiedBudget(state.workingUb))
		{
			strHtml += '<button type="button" class="btn btn-outline-danger" id="btn-cancel-ub">Cancel Unified Budget</button>';
		}

		if (blnEditable &&
			(state.wizardStep === WIZARD_STEP_GENERAL ||
			state.wizardStep === WIZARD_STEP_CONSOLIDATION ||
			state.wizardStep === WIZARD_STEP_ATTACHMENTS ||
			state.wizardStep === WIZARD_STEP_REVIEW))
		{
			strHtml += PrototypeUi.renderOutlineSecondaryButton('Save Draft', { id: 'btn-save-draft' });
		}

		if (state.wizardStep === WIZARD_STEP_REVIEW && blnEditable)
		{
			var strSubmitLabel = (state.workingUb.versions || []).length > 0 ? 'Resubmit Unified Budget' : 'Submit Unified Budget';
			strHtml += PrototypeUi.renderPrimaryButton(strSubmitLabel, { id: 'btn-submit-ub' });
		}

		elDetailFooter.innerHTML = strHtml;
	}

	function renderFooterActions()
	{
		if (isUnifiedBudgetTabMode())
		{
			renderFooterActionsTabMode();
			return;
		}

		var strHtml = '';
		var blnEditable = isUbEditable();

		if (canCancelUnifiedBudget(state.workingUb))
		{
			strHtml += '<button type="button" class="btn btn-outline-danger" id="btn-cancel-ub">Cancel Unified Budget</button>';
		}

		if (state.wizardStep === WIZARD_STEP_GENERAL)
		{
			if (blnEditable) strHtml += PrototypeUi.renderOutlineSecondaryButton('Save Draft', { id: 'btn-save-draft' });
			strHtml += PrototypeUi.renderPrimaryButton('Next: Consolidation', { 'data-wizard-step': WIZARD_STEP_CONSOLIDATION });
		}
		else if (state.wizardStep === WIZARD_STEP_CONSOLIDATION)
		{
			strHtml += '<button type="button" class="btn btn-outline-secondary" data-wizard-step="' + WIZARD_STEP_GENERAL + '">Back</button>';
			if (blnEditable) strHtml += PrototypeUi.renderOutlineSecondaryButton('Save Draft', { id: 'btn-save-draft' });
			strHtml += PrototypeUi.renderPrimaryButton('Next: Attachments & Justification', { 'data-wizard-step': WIZARD_STEP_ATTACHMENTS });
		}
		else if (state.wizardStep === WIZARD_STEP_ATTACHMENTS)
		{
			strHtml += '<button type="button" class="btn btn-outline-secondary" data-wizard-step="' + WIZARD_STEP_CONSOLIDATION + '">Back</button>';
			if (blnEditable) strHtml += PrototypeUi.renderOutlineSecondaryButton('Save Draft', { id: 'btn-save-draft' });
			strHtml += PrototypeUi.renderPrimaryButton('Next: Review & Submit', { 'data-wizard-step': WIZARD_STEP_REVIEW });
		}
		else if (state.wizardStep === WIZARD_STEP_REVIEW)
		{
			strHtml += '<button type="button" class="btn btn-outline-secondary" data-wizard-step="' + WIZARD_STEP_ATTACHMENTS + '">Back</button>';
			if (blnEditable) strHtml += PrototypeUi.renderOutlineSecondaryButton('Save Draft', { id: 'btn-save-draft' });
			if (blnEditable)
			{
				var strSubmitLabel = (state.workingUb.versions || []).length > 0 ? 'Resubmit Unified Budget' : 'Submit Unified Budget';
				strHtml += PrototypeUi.renderPrimaryButton(strSubmitLabel, { id: 'btn-submit-ub' });
			}
		}
		else if (state.wizardStep === WIZARD_STEP_APPROVAL_HISTORY)
		{
			strHtml += '<button type="button" class="btn btn-outline-secondary" data-wizard-step="' + WIZARD_STEP_REVIEW + '">Back to Review</button>';
			if (isVersioningVisible())
			{
				strHtml += PrototypeUi.renderPrimaryButton('Version', { 'data-wizard-step': WIZARD_STEP_VERSION });
			}
			else if (isExternalTrackingStepVisible())
			{
				strHtml += PrototypeUi.renderPrimaryButton('External Tracking', { 'data-wizard-step': WIZARD_STEP_EXTERNAL_TRACKING });
			}
		}
		else if (state.wizardStep === WIZARD_STEP_VERSION)
		{
			strHtml += '<button type="button" class="btn btn-outline-secondary" data-wizard-step="' + WIZARD_STEP_APPROVAL_HISTORY + '">Back to Approval History</button>';
			if (isExternalTrackingStepVisible())
			{
				strHtml += PrototypeUi.renderPrimaryButton('External Tracking', { 'data-wizard-step': WIZARD_STEP_EXTERNAL_TRACKING });
			}
		}
		else if (state.wizardStep === WIZARD_STEP_EXTERNAL_TRACKING)
		{
			strHtml += '<button type="button" class="btn btn-outline-secondary" data-wizard-step="' + WIZARD_STEP_APPROVAL_HISTORY + '">Back</button>';
			if (isApprovalHistoryVisible())
			{
				strHtml += '<button type="button" class="btn btn-outline-secondary" data-wizard-step="' + WIZARD_STEP_APPROVAL_HISTORY + '">Approval History</button>';
			}
		}

		elDetailFooter.innerHTML = strHtml;
	}

	//this function renders the unified budget approval form using the budget request review pattern
	function renderUnifiedBudgetReviewAction()
	{
		var blnIsReject = state.reviewForm.decision === 'Reject';
		var blnShowOther = state.reviewForm.reason === 'Others';
		var strButtonLabel = blnIsReject ? 'Reject Unified Budget' : 'Approve Unified Budget';
		var strReasonBlock = '';

		if (blnIsReject)
		{
			strReasonBlock = '<div class="mb-3"><label class="form-label" for="ub-review-reason">Reason</label>' +
				'<select class="form-select form-select-sm" id="ub-review-reason">' +
					['For Clarification', 'For Revision', 'Budget Adjustment Required', 'Others'].map(function(strOption)
					{
						return '<option value="' + strOption + '"' + (state.reviewForm.reason === strOption ? ' selected' : '') + '>' + strOption + '</option>';
					}).join('') +
				'</select></div>';

			if (blnShowOther)
			{
				strReasonBlock += '<div class="mb-3"><label class="form-label" for="ub-review-other">Specify Other Reason</label>' +
					'<input type="text" class="form-control form-control-sm" id="ub-review-other" value="' + escapeHtml(state.reviewForm.otherReason) + '"></div>';
			}
		}

		return '<div class="br-card mb-4">' +
			'<p class="fw-bold text-uppercase section-eyebrow mb-3">Approval Action</p>' +
			'<div class="mb-3"><label class="form-label" for="ub-review-decision">Decision</label>' +
				'<select class="form-select form-select-sm" id="ub-review-decision">' +
					'<option value="Approve"' + (blnIsReject ? '' : ' selected') + '>Approve</option>' +
					'<option value="Reject"' + (blnIsReject ? ' selected' : '') + '>Reject</option>' +
				'</select></div>' +
			strReasonBlock +
			'<div class="mb-3"><label class="form-label" for="ub-review-remark">Remark</label>' +
				'<textarea class="form-control form-control-sm" id="ub-review-remark" rows="3" placeholder="Enter approval remark">' + escapeHtml(state.reviewForm.remark) + '</textarea></div>' +
			'<button type="button" class="btn btn-primary w-100" id="btn-submit-ub-review">' + strButtonLabel + '</button>' +
		'</div>';
	}

	function renderContextPanel()
	{
		if (state.wizardStep === WIZARD_STEP_CONSOLIDATION ||
			state.wizardStep === WIZARD_STEP_VERSION ||
			state.wizardStep === WIZARD_STEP_APPROVAL_HISTORY ||
			state.wizardStep === WIZARD_STEP_EXTERNAL_TRACKING)
		{
			elContextPanel.innerHTML = '';
			elContextPanel.classList.add('ub-context-panel--hidden');
			return;
		}

		elContextPanel.classList.remove('ub-context-panel--hidden');
		elContextPanel.innerHTML = (canApproveInternalStages(state.workingUb) ? renderUnifiedBudgetReviewAction() : '') +
			renderWorkflowPanel();
	}

	function renderWizardContent()
	{
		elDetailBody.classList.remove('ub-detail-body--consolidation');

		if (state.wizardStep === WIZARD_STEP_GENERAL)
		{
			elWizardContent.innerHTML = wrapWizardStepWithBannerUb(renderStepGeneral());
		}
		else if (state.wizardStep === WIZARD_STEP_CONSOLIDATION)
		{
			elDetailBody.classList.add('ub-detail-body--consolidation');
			elWizardContent.innerHTML = renderStepConsolidation();
		}
		else if (state.wizardStep === WIZARD_STEP_ATTACHMENTS)
		{
			elWizardContent.innerHTML = wrapWizardStepWithBannerUb(renderStepAttachments());
		}
		else if (state.wizardStep === WIZARD_STEP_REVIEW)
		{
			elWizardContent.innerHTML = wrapWizardStepWithBannerUb(renderStepReview());
		}
		else if (state.wizardStep === WIZARD_STEP_VERSION)
		{
			elWizardContent.innerHTML = wrapWizardStepWithBannerUb(renderStepVersion());
		}
		else if (state.wizardStep === WIZARD_STEP_APPROVAL_HISTORY)
		{
			elWizardContent.innerHTML = wrapWizardStepWithBannerUb(renderStepApprovalHistory());
		}
		else if (state.wizardStep === WIZARD_STEP_EXTERNAL_TRACKING)
		{
			if (!state.externalUpdateForm.stageKey)
			{
				state.externalUpdateForm.stageKey = getDefaultExternalStageKey(state.workingUb);
			}
			elWizardContent.innerHTML = wrapWizardStepWithBannerUb(renderStepExternalTracking());
		}
	}

	function syncFormFromDom()
	{
		if (!isUbEditable()) return;

		var elTitle = document.getElementById('ub-title');
		var elDesc = document.getElementById('ub-description');
		var elYear = document.getElementById('ub-fiscal-year');
		if (elTitle) state.workingUb.title = elTitle.value;
		if (elDesc) state.workingUb.description = elDesc.value;
		if (elYear) state.workingUb.fiscalYear = elYear.value;
	}

	function syncAttachmentsFromDom()
	{
		if (!isUbEditable()) return;

		var elJustification = document.getElementById('ub-justification');
		if (elJustification) state.justificationDraft = elJustification.value;
	}

	function saveDraft()
	{
		syncFormFromDom();
		syncAttachmentsFromDom();
		state.workingUb.lastUpdated = new Date().toISOString();
		state.workingUb.grandTotal = computeUbGrandTotal(state.workingUb);
		syncWorkingUbToStore();
		renderDetailHeader();
		window.alert('Unified budget draft saved.');
	}

	function submitUnifiedBudget()
	{
		syncFormFromDom();
		syncAttachmentsFromDom();
		var strNow = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
		var intNextVersion = (state.workingUb.versions || []).length + 1;
		var objSnapshot = buildVersionSnapshot(state.workingUb);

		if (!state.workingUb.referenceNo)
		{
			var strFiscalYear = String(state.workingUb.fiscalYear || '2027');
			var intMaxSequence = UNIFIED_BUDGETS.reduce(function(intMax, objUb)
			{
				var arrMatch = String(objUb.referenceNo || '').match(new RegExp('^UB-' + strFiscalYear + '-(\\d+)$'));
				var intSequence = arrMatch ? Number(arrMatch[1]) : 0;

				return Math.max(intMax, intSequence);
			}, 0);

			state.workingUb.referenceNo = 'UB-' + strFiscalYear + '-' + String(intMaxSequence + 1).padStart(3, '0');
		}

		state.workingUb.versions = state.workingUb.versions || [];
		state.workingUb.versions.push({
			versionNumber: intNextVersion,
			dateTime: strNow,
			userName: 'Budget Division',
			userRole: 'PDO',
			status: 'submitted',
			remarks: intNextVersion === 1 ? 'Initial submission for approval workflow.' : 'Resubmitted after revision.',
			snapshot: objSnapshot
		});

		state.workingUb.approvalHistory = state.workingUb.approvalHistory || [];
		state.workingUb.approvalHistory.push({
			date: strNow,
			user: 'Budget Division',
			role: 'PDO',
			action: intNextVersion === 1 ? 'Submit' : 'Resubmit',
			reason: 'Consolidation complete',
			remark: intNextVersion === 1 ? 'Initial submission for approval workflow.' : 'Resubmitted after revision.'
		});

		state.workingUb.status = 'PENDING';
		state.workingUb.currentStage = 'Planning Director';
		state.workingUb.submittedAt = strNow;
		state.workingUb.lastUpdated = new Date().toISOString();
		state.workingUb.grandTotal = computeUbGrandTotal(state.workingUb);
		syncWorkingUbToStore();
		window.alert('Unified budget submitted. Version ' + intNextVersion + ' created.');
		backToList();
	}

	//this function cancels the selected unified budget and closes its workflow
	function cancelUnifiedBudget()
	{
		if (!canCancelUnifiedBudget(state.workingUb))
		{
			return;
		}

		if (!window.confirm('Cancel this unified budget? This action cannot be undone.'))
		{
			return;
		}

		state.workingUb.approvalHistory = state.workingUb.approvalHistory || [];
		state.workingUb.approvalHistory.push({
			date: formatDisplayNow(),
			user: CURRENT_ACTOR_NAME,
			role: 'PDO',
			action: 'Cancel',
			reason: 'Unified budget cancelled',
			remark: 'Workflow closed by the Budget Division.'
		});
		state.workingUb.status = 'CANCELLED';
		state.workingUb.currentStage = 'Cancelled';
		state.workingUb.lastUpdated = getCurrentTimestampIso();
		syncWorkingUbToStore();
		window.alert('Unified budget cancelled.');
		backToList();
	}

	//this function approves every internal stage for the prototype demonstration
	function approveAllInternalStages()
	{
		var arrInternalApprovals = [
			{ user: 'Dr. Elena Reyes', role: 'Planning Director', remark: state.reviewForm.remark || 'Planning alignment approved.' },
			{ user: 'Miguel Santos', role: 'Finance Director', remark: 'Financial review approved.' },
			{ user: 'Atty. Carla Mendoza', role: 'USEC', remark: 'Undersecretary review approved.' },
			{ user: 'Secretary Renato Cruz', role: 'Secretary', remark: 'Internal approval completed.' }
		];

		if (!canApproveInternalStages(state.workingUb))
		{
			return;
		}

		if (!window.confirm('Approve all internal stages for this unified budget?'))
		{
			return;
		}

		state.workingUb.approvalHistory = state.workingUb.approvalHistory || [];
		arrInternalApprovals.forEach(function(objApproval)
		{
			state.workingUb.approvalHistory.push({
				date: formatDisplayNow(),
				user: objApproval.user,
				role: objApproval.role,
				action: 'Approve',
				reason: 'Internal review completed',
				remark: objApproval.remark
			});
		});

		state.workingUb.status = 'PENDING';
		state.workingUb.currentStage = 'DBM';
		state.workingUb.lastUpdated = getCurrentTimestampIso();
		state.externalUpdateForm = { stageKey: 'dbm', decision: 'approved', remarks: '' };
		syncWorkingUbToStore();
		state.view = 'detail';
		state.wizardStep = WIZARD_STEP_EXTERNAL_TRACKING;
		renderPage();
		window.alert('All internal stages approved. External Tracking is now available.');
	}

	//this function rejects the pending unified budget and returns it for revision
	function rejectUnifiedBudget()
	{
		var strReason = state.reviewForm.reason === 'Others'
			? state.reviewForm.otherReason
			: state.reviewForm.reason;

		if (!canApproveInternalStages(state.workingUb))
		{
			return;
		}

		if (!window.confirm('Reject this unified budget and return it for revision?'))
		{
			return;
		}

		state.workingUb.approvalHistory = state.workingUb.approvalHistory || [];
		state.workingUb.approvalHistory.push({
			date: formatDisplayNow(),
			user: 'Dr. Elena Reyes',
			role: 'Planning Director',
			action: 'Reject',
			reason: strReason,
			remark: state.reviewForm.remark
		});
		state.workingUb.status = 'REJECTED';
		state.workingUb.lastUpdated = getCurrentTimestampIso();
		syncWorkingUbToStore();
		window.alert('Unified budget rejected and returned to the Budget Division for revision.');
		backToList();
	}

	function openDetailView(strUbId, strMode)
	{
		var objStored = UNIFIED_BUDGETS.find(function(u) { return u.id === strUbId; });
		if (!objStored) return;
		state.view = 'detail';
		state.selectedUbId = strUbId;
		state.detailMode = strMode || 'view';
		state.workingUb = JSON.parse(JSON.stringify(objStored));
		ensureUbAttachments(state.workingUb);
		ensureExternalTracking(state.workingUb);
		state.justificationDraft = '';
		state.reviewForm = { decision: 'Approve', reason: 'For Revision', otherReason: '', remark: '' };
		state.externalUpdateForm = {
			stageKey: getDefaultExternalStageKey(state.workingUb),
			decision: 'approved',
			remarks: ''
		};
		state.wizardStep = WIZARD_STEP_GENERAL;
		state.consolidationExpanded = {};
		state.versionTreeExpanded = {};
		state.versionExpanded = {};
		renderPage();
	}

	function openNewUnifiedBudget(arrRequestIds)
	{
		var strNewId = 'ub-new-' + Date.now();
		var objNew = createEmptyUb(strNewId, arrRequestIds);
		objNew.title = 'FY 2027 Consolidated Budget (New)';
		objNew.description = 'New unified budget package from eligible validated budget requests.';
		state.view = 'detail';
		state.selectedUbId = strNewId;
		state.detailMode = 'edit';
		state.workingUb = objNew;
		ensureUbAttachments(state.workingUb);
		ensureExternalTracking(state.workingUb);
		state.justificationDraft = '';
		state.externalUpdateForm = { stageKey: '', decision: 'approved', remarks: '' };
		state.wizardStep = WIZARD_STEP_GENERAL;
		state.consolidationExpanded = {};
		state.versionTreeExpanded = {};
		state.versionExpanded = {};
		renderPage();
	}

	function backToList()
	{
		state.view = 'list';
		state.workingUb = null;
		state.selectedUbId = null;
		renderPage();
	}

	function bindDetailEvents()
	{
		document.getElementById('btn-back').onclick = backToList;

		var elTitle = document.getElementById('ub-title');
		if (elTitle)
		{
			elTitle.oninput = function()
			{
				if (!isUbEditable()) return;
				state.workingUb.title = elTitle.value;
				renderDetailHeader();
			};
		}
		var elDesc = document.getElementById('ub-description');
		if (elDesc)
		{
			elDesc.oninput = function()
			{
				if (!isUbEditable()) return;
				state.workingUb.description = elDesc.value;
			};
		}
		var elYear = document.getElementById('ub-fiscal-year');
		if (elYear)
		{
			elYear.onchange = function()
			{
				if (!isUbEditable()) return;
				state.workingUb.fiscalYear = elYear.value;
			};
		}

		document.querySelectorAll('[data-wizard-step]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				syncFormFromDom();
				syncAttachmentsFromDom();
				state.wizardStep = Number(elBtn.getAttribute('data-wizard-step'));
				renderDetailPage();
			};
		});

		var elAddFile = document.getElementById('btn-add-attachment-file');
		var elFileInput = document.getElementById('ub-attachment-file-input');
		if (elAddFile && elFileInput)
		{
			elAddFile.onclick = function() { elFileInput.click(); };
			elFileInput.onchange = function()
			{
				if (!isUbEditable()) return;
				ensureUbAttachments(state.workingUb);
				Array.prototype.forEach.call(elFileInput.files || [], function(objFile)
				{
					state.workingUb.attachedFiles.push({
						id: 'file-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
						name: objFile.name,
						size: objFile.size,
						type: objFile.type || 'File',
						uploadedAt: getCurrentTimestampIso(),
						uploadedBy: CURRENT_ACTOR_NAME
					});
				});
				elFileInput.value = '';
				renderDetailPage();
			};
		}

		document.querySelectorAll('[data-detach-file]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				if (!isUbEditable()) return;
				var strId = elBtn.getAttribute('data-detach-file');
				state.workingUb.attachedFiles = state.workingUb.attachedFiles.filter(function(f) { return f.id !== strId; });
				renderDetailPage();
			};
		});

		var elJustification = document.getElementById('ub-justification');
		if (elJustification)
		{
			elJustification.oninput = function()
			{
				if (!isUbEditable()) return;
				state.justificationDraft = elJustification.value;
				var elPost = document.getElementById('btn-post-justification');
				if (elPost) elPost.disabled = !String(elJustification.value || '').trim();
			};
		}

		var elPostJustification = document.getElementById('btn-post-justification');
		if (elPostJustification)
		{
			elPostJustification.onclick = function()
			{
				syncAttachmentsFromDom();
				postJustification();
			};
		}

		var elStartExternal = document.getElementById('btn-start-external-tracking');
		if (elStartExternal)
		{
			elStartExternal.onclick = function() { startExternalTracking(); };
		}

		var elExtStage = document.getElementById('ub-ext-stage');
		if (elExtStage)
		{
			elExtStage.onchange = function()
			{
				state.externalUpdateForm.stageKey = elExtStage.value;
			};
		}

		document.querySelectorAll('[data-ext-decision]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				if (!canRecordExternalUpdate(state.workingUb)) return;
				state.externalUpdateForm.decision = elBtn.getAttribute('data-ext-decision');
				renderDetailPage();
			};
		});

		var elExtRemarks = document.getElementById('ub-ext-remarks');
		if (elExtRemarks)
		{
			elExtRemarks.oninput = function()
			{
				state.externalUpdateForm.remarks = elExtRemarks.value;
			};
		}

		var elExtUpdate = document.getElementById('btn-ext-stage-update');
		if (elExtUpdate)
		{
			elExtUpdate.onclick = function()
			{
				if (elExtStage) state.externalUpdateForm.stageKey = elExtStage.value;
				if (elExtRemarks) state.externalUpdateForm.remarks = elExtRemarks.value;
				applyExternalStageUpdate();
			};
		}

		var elExtUploadZone = document.getElementById('ub-ext-upload-zone');
		var elExtFileInput = document.getElementById('ub-ext-file-input');
		if (elExtUploadZone && elExtFileInput)
		{
			elExtUploadZone.onclick = function()
			{
				if (!canRecordExternalUpdate(state.workingUb)) return;
				elExtFileInput.click();
			};
			elExtFileInput.onchange = function()
			{
				if (!canRecordExternalUpdate(state.workingUb)) return;
				ensureExternalTracking(state.workingUb);
				var strStageTitle = getStageTitleByKey(state.externalUpdateForm.stageKey);
				Array.prototype.forEach.call(elExtFileInput.files || [], function(objFile)
				{
					state.workingUb.externalDocuments.push({
						id: 'ext-doc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
						name: objFile.name,
						size: objFile.size,
						type: objFile.type || 'File',
						stage: strStageTitle,
						uploadedAt: getCurrentTimestampIso(),
						uploadedBy: CURRENT_ACTOR_NAME
					});
				});
				elExtFileInput.value = '';
				state.workingUb.lastUpdated = getCurrentTimestampIso();
				syncWorkingUbToStore();
				renderDetailPage();
			};
		}

		var elSave = document.getElementById('btn-save-draft');
		if (elSave) elSave.onclick = saveDraft;

		var elSubmit = document.getElementById('btn-submit-ub');
		if (elSubmit) elSubmit.onclick = submitUnifiedBudget;

		var elReviewDecision = document.getElementById('ub-review-decision');
		if (elReviewDecision)
		{
			elReviewDecision.onchange = function()
			{
				state.reviewForm.decision = elReviewDecision.value;
				renderDetailPage();
			};
		}

		var elReviewReason = document.getElementById('ub-review-reason');
		if (elReviewReason)
		{
			elReviewReason.onchange = function()
			{
				state.reviewForm.reason = elReviewReason.value;
				renderDetailPage();
			};
		}

		var elReviewOther = document.getElementById('ub-review-other');
		if (elReviewOther) elReviewOther.oninput = function() { state.reviewForm.otherReason = elReviewOther.value; };

		var elReviewRemark = document.getElementById('ub-review-remark');
		if (elReviewRemark) elReviewRemark.oninput = function() { state.reviewForm.remark = elReviewRemark.value; };

		var elSubmitReview = document.getElementById('btn-submit-ub-review');
		if (elSubmitReview)
		{
			elSubmitReview.onclick = function()
			{
				var blnMissingRemark = !String(state.reviewForm.remark || '').trim();
				var blnMissingOtherReason = state.reviewForm.decision === 'Reject' &&
					state.reviewForm.reason === 'Others' &&
					!String(state.reviewForm.otherReason || '').trim();

				if (blnMissingRemark || blnMissingOtherReason)
				{
					window.alert('Remark is required. If Reason is Others, specify the other reason.');
					return;
				}

				if (state.reviewForm.decision === 'Reject')
				{
					rejectUnifiedBudget();
				}
				else
				{
					approveAllInternalStages();
				}
			};
		}

		var elCancel = document.getElementById('btn-cancel-ub');
		if (elCancel) elCancel.onclick = cancelUnifiedBudget;

		document.querySelectorAll('[data-toggle-consolidation]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				var strKey = elBtn.getAttribute('data-toggle-consolidation');
				state.consolidationExpanded[strKey] = !isConsolidationExpanded(strKey);
				renderDetailPage();
			};
		});

		document.querySelectorAll('[data-toggle-version-tree]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				var intVer = Number(elBtn.getAttribute('data-version-number'));
				var strTreeKey = elBtn.getAttribute('data-tree-key');
				var strStateKey = 'v' + intVer + '|' + strTreeKey;
				state.versionTreeExpanded[strStateKey] = !isVersionTreeExpanded(intVer, strTreeKey);
				renderDetailPage();
			};
		});

		document.querySelectorAll('[data-toggle-version]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				var intVersionNumber = Number(elBtn.getAttribute('data-toggle-version'));
				var strKey = getVersionExpandKey(intVersionNumber);
				var blnIsLatest = false;
				var arrVersions = (state.workingUb.versions || []).slice().sort(function(a, b) { return b.versionNumber - a.versionNumber; });
				if (arrVersions.length > 0)
				{
					blnIsLatest = arrVersions[0].versionNumber === intVersionNumber;
				}
				state.versionExpanded[strKey] = !isVersionExpanded(intVersionNumber, blnIsLatest);
				renderDetailPage();
			};
		});
	}

	function renderDetailPage()
	{
		document.title = (state.detailMode === 'edit' ? 'Edit' : 'View') + ' Unified Budget — Prototype';
		elPageTitle.textContent = state.detailMode === 'edit' ? 'Edit Unified Budget' : 'View Unified Budget';
		renderDetailHeader();
		renderWizardStepper();
		renderWizardContent();
		renderContextPanel();
		renderFooterActions();
		bindDetailEvents();
	}

	/* -- List view ----------------------------------- */
	function renderSelectOptions(arrOptions, strSelected)
	{
		var strHtml = '<option value="">All</option>';
		arrOptions.forEach(function(strOpt)
		{
			var strSel = strOpt === strSelected ? ' selected' : '';
			strHtml += '<option value="' + escapeHtml(strOpt) + '"' + strSel + '>' + escapeHtml(strOpt) + '</option>';
		});
		return strHtml;
	}

	function filterBudgets()
	{
		var f = state.appliedFilters;
		return UNIFIED_BUDGETS.filter(function(objItem)
		{
			var strSearch = f.search.toLowerCase().trim();
			var blnSearch = !strSearch
				|| objItem.referenceNo.toLowerCase().indexOf(strSearch) >= 0
				|| objItem.title.toLowerCase().indexOf(strSearch) >= 0;
			var blnYear = !f.fiscalYear || objItem.fiscalYear === f.fiscalYear;
			var blnStatus = !f.status || objItem.status === f.status;
			var blnStage = !f.stage || objItem.currentStage === f.stage;
			return blnSearch && blnYear && blnStatus && blnStage;
		});
	}

	function sortBudgets(arrItems)
	{
		var strKey = state.sortKey;
		var intDir = state.sortDir === 'asc' ? 1 : -1;
		return arrItems.slice().sort(function(objA, objB)
		{
			var valA = objA[strKey];
			var valB = objB[strKey];
			if (strKey === 'grandTotal') return (Number(valA) - Number(valB)) * intDir;
			if (strKey === 'lastUpdated') return (new Date(valA) - new Date(valB)) * intDir;
			valA = String(valA || '').toLowerCase();
			valB = String(valB || '').toLowerCase();
			if (valA < valB) return -1 * intDir;
			if (valA > valB) return 1 * intDir;
			return 0;
		});
	}

	function getPaginatedRows()
	{
		var arrFiltered = sortBudgets(filterBudgets());
		var intStart = (state.currentPage - 1) * PAGE_SIZE;
		return { items: arrFiltered.slice(intStart, intStart + PAGE_SIZE), total: arrFiltered.length };
	}

	function renderSortIndicator(strKey)
	{
		if (state.sortKey !== strKey) return '';
		return state.sortDir === 'asc' ? ' ↑' : ' ↓';
	}

	function renderActionMenu(objRow)
	{
		var blnOpen = state.openActionMenuId === objRow.id;
		var strStatus = String(objRow.status || '').toUpperCase();
		var blnCanEdit = strStatus === 'DRAFT' || strStatus === 'REJECTED';
		var blnCanCancel = canCancelUnifiedBudget(objRow);
		var blnCanApprove = canApproveInternalStages(objRow);
		var strItems = '<button type="button" class="ub-action-menu__item" data-action="view" data-id="' + escapeHtml(objRow.id) + '">View</button>';
		if (blnCanEdit) strItems += '<button type="button" class="ub-action-menu__item" data-action="edit" data-id="' + escapeHtml(objRow.id) + '">Edit</button>';
		if (blnCanApprove) strItems += '<button type="button" class="ub-action-menu__item" data-action="approve" data-id="' + escapeHtml(objRow.id) + '">Approve</button>';
		if (blnCanCancel) strItems += '<button type="button" class="ub-action-menu__item text-danger" data-action="cancel" data-id="' + escapeHtml(objRow.id) + '">Cancel Unified Budget</button>';
		return '<div class="ub-action-menu">' +
			'<button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle" data-toggle-actions="' + escapeHtml(objRow.id) + '">Actions</button>' +
			'<div class="ub-action-menu__menu' + (blnOpen ? ' ub-action-menu__menu--open' : '') + '">' + strItems + '</div></div>';
	}

	function renderListView()
	{
		var objPage = getPaginatedRows();
		var intLastPage = Math.max(1, Math.ceil(objPage.total / PAGE_SIZE));
		if (state.currentPage > intLastPage) state.currentPage = intLastPage;

		var strRows = objPage.items.map(function(objItem)
		{
			return '<tr>' +
				'<td><span class="ub-ref">' + escapeHtml(objItem.referenceNo || '—') + '</span><span class="ub-ref__title">' + escapeHtml(objItem.title) + '</span></td>' +
				'<td>' + escapeHtml(objItem.fiscalYear) + '</td>' +
				'<td class="text-end fw-semibold">' + formatCurrency(objItem.grandTotal) + '</td>' +
				'<td><span class="status-badge status-badge--stage">' + escapeHtml(objItem.currentStage) + '</span></td>' +
				'<td><span class="status-badge ' + getStatusBadgeClass(objItem.status) + '">' + escapeHtml(getDisplayStatus(objItem.status)) + '</span></td>' +
				'<td>' + escapeHtml(formatTimestamp(objItem.lastUpdated)) + '</td>' +
				'<td>' + renderActionMenu(objItem) + '</td></tr>';
		}).join('');

		if (!strRows) strRows = '<tr><td colspan="7" class="text-center text-muted py-4">No unified budgets found.</td></tr>';

		var intFrom = objPage.total === 0 ? 0 : ((state.currentPage - 1) * PAGE_SIZE) + 1;
		var intTo = Math.min(state.currentPage * PAGE_SIZE, objPage.total);

		elListView.innerHTML =
			'<div class="ub-page"><header class="ub-page-header"><div>' +
				'<h1>Unified Budget</h1>' +
				'<p>View and manage consolidated unified budget packages across fiscal years.</p>' +
			'</div>' +
				'<button type="button" class="btn btn-primary btn-sm fw-semibold" id="btn-consolidate">Consolidate Budget</button>' +
			'</header><div class="br-card">' +
			'<div class="ub-filters">' +
				'<div><label class="form-label small" for="filter-search">Search</label>' +
				'<input type="search" class="form-control form-control-sm" id="filter-search" placeholder="Reference no. or title" value="' + escapeHtml(state.filters.search) + '"></div>' +
				'<div><label class="form-label small" for="filter-year">Fiscal Year</label>' +
				'<select class="form-select form-select-sm" id="filter-year">' + renderSelectOptions(['2027', '2026', '2025', '2024'], state.filters.fiscalYear) + '</select></div>' +
				'<div><label class="form-label small" for="filter-status">Status</label>' +
				'<select class="form-select form-select-sm" id="filter-status">' + renderSelectOptions(STATUS_OPTIONS, state.filters.status) + '</select></div>' +
				'<div><label class="form-label small" for="filter-stage">Current Stage</label>' +
				'<select class="form-select form-select-sm" id="filter-stage">' + renderSelectOptions(STAGE_OPTIONS, state.filters.stage) + '</select></div>' +
				'<div class="ub-filter-actions">' +
					'<button type="button" class="btn btn-primary btn-sm" id="btn-apply-filters">Apply Filters</button>' +
					'<button type="button" class="btn btn-outline-secondary btn-sm" id="btn-clear-filters">Clear Filters</button>' +
				'</div></div>' +
			'<div class="br-table-wrap"><table class="br-table"><thead><tr>' +
				'<th class="br-table__sortable" data-sort="referenceNo">Reference No.' + renderSortIndicator('referenceNo') + '</th>' +
				'<th class="br-table__sortable" data-sort="fiscalYear">Fiscal Year' + renderSortIndicator('fiscalYear') + '</th>' +
				'<th class="br-table__sortable text-end" data-sort="grandTotal">Grand Total' + renderSortIndicator('grandTotal') + '</th>' +
				'<th class="br-table__sortable" data-sort="currentStage">Current Stage' + renderSortIndicator('currentStage') + '</th>' +
				'<th class="br-table__sortable" data-sort="status">Status' + renderSortIndicator('status') + '</th>' +
				'<th class="br-table__sortable" data-sort="lastUpdated">Last Update' + renderSortIndicator('lastUpdated') + '</th>' +
				'<th>Action</th></tr></thead><tbody>' + strRows + '</tbody></table></div>' +
			'<div class="ub-pagination"><span>Showing ' + intFrom + '–' + intTo + ' of ' + objPage.total + '</span>' +
				'<div class="btn-group btn-group-sm">' +
					'<button type="button" class="btn btn-outline-secondary" id="btn-prev-page"' + (state.currentPage <= 1 ? ' disabled' : '') + '>Previous</button>' +
					'<button type="button" class="btn btn-outline-secondary" disabled>Page ' + state.currentPage + ' / ' + intLastPage + '</button>' +
					'<button type="button" class="btn btn-outline-secondary" id="btn-next-page"' + (state.currentPage >= intLastPage ? ' disabled' : '') + '>Next</button>' +
				'</div></div></div></div>';
	}

	function applyFilters()
	{
		state.appliedFilters = { search: state.filters.search, fiscalYear: state.filters.fiscalYear, status: state.filters.status, stage: state.filters.stage };
		state.currentPage = 1;
		renderPage();
	}

	function clearFilters()
	{
		state.filters = { search: '', fiscalYear: '', status: '', stage: '' };
		state.appliedFilters = { search: '', fiscalYear: '', status: '', stage: '' };
		state.currentPage = 1;
		renderPage();
	}

	function bindListEvents()
	{
		var elSearch = document.getElementById('filter-search');
		if (elSearch)
		{
			elSearch.oninput = function(evt) { state.filters.search = evt.target.value; };
			elSearch.onkeydown = function(evt) { if (evt.key === 'Enter') applyFilters(); };
		}
		var elYear = document.getElementById('filter-year');
		if (elYear) elYear.onchange = function(evt) { state.filters.fiscalYear = evt.target.value; };
		var elStatus = document.getElementById('filter-status');
		if (elStatus) elStatus.onchange = function(evt) { state.filters.status = evt.target.value; };
		var elStage = document.getElementById('filter-stage');
		if (elStage) elStage.onchange = function(evt) { state.filters.stage = evt.target.value; };

		var elApply = document.getElementById('btn-apply-filters');
		if (elApply) elApply.onclick = applyFilters;
		var elClear = document.getElementById('btn-clear-filters');
		if (elClear) elClear.onclick = clearFilters;

		var elConsolidate = document.getElementById('btn-consolidate');
		if (elConsolidate) elConsolidate.onclick = openConsolidateModal;

		document.querySelectorAll('[data-sort]').forEach(function(elTh)
		{
			elTh.onclick = function()
			{
				var strKey = elTh.getAttribute('data-sort');
				if (state.sortKey === strKey) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
				else { state.sortKey = strKey; state.sortDir = 'asc'; }
				state.currentPage = 1;
				renderPage();
			};
		});

		var elPrev = document.getElementById('btn-prev-page');
		if (elPrev) elPrev.onclick = function() { state.currentPage -= 1; renderPage(); };
		var elNext = document.getElementById('btn-next-page');
		if (elNext) elNext.onclick = function() { state.currentPage += 1; renderPage(); };

		document.querySelectorAll('[data-toggle-actions]').forEach(function(elBtn)
		{
			elBtn.onclick = function(evt)
			{
				evt.stopPropagation();
				var strId = elBtn.getAttribute('data-toggle-actions');
				state.openActionMenuId = state.openActionMenuId === strId ? null : strId;
				renderPage();
			};
		});

		document.querySelectorAll('[data-action]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				var strAction = elBtn.getAttribute('data-action');
				var strId = elBtn.getAttribute('data-id');
				state.openActionMenuId = null;
				if (strAction === 'cancel')
				{
					var objStored = UNIFIED_BUDGETS.find(function(objUb) { return objUb.id === strId; });
					if (!objStored) return;
					state.selectedUbId = strId;
					state.detailMode = 'view';
					state.workingUb = JSON.parse(JSON.stringify(objStored));
					ensureUbAttachments(state.workingUb);
					ensureExternalTracking(state.workingUb);
					cancelUnifiedBudget();
					return;
				}
				if (strAction === 'approve')
				{
					openDetailView(strId, 'view');
					state.wizardStep = WIZARD_STEP_REVIEW;
					renderPage();
					return;
				}
				openDetailView(strId, strAction === 'edit' ? 'edit' : 'view');
			};
		});

		document.addEventListener('click', function closeMenus()
		{
			if (state.openActionMenuId) { state.openActionMenuId = null; renderPage(); }
		}, { once: true });
	}

	function renderConsolidateModalBody()
	{
		var intTotal = ELIGIBLE_BUDGET_REQUESTS.length;
		var dblGrand = ELIGIBLE_BUDGET_REQUESTS.reduce(function(s, r) { return s + r.grandTotal; }, 0);
		var strRows = ELIGIBLE_BUDGET_REQUESTS.map(function(objReq)
		{
			return '<tr>' +
				'<td><span class="ub-ref">' + escapeHtml(objReq.referenceNo) + '</span></td>' +
				'<td>' + escapeHtml(objReq.title) + '</td>' +
				'<td>' + escapeHtml(objReq.requestingUnit) + '</td>' +
				'<td>' + escapeHtml(objReq.agencyCategory) + '</td>' +
				'<td class="text-end fw-semibold">' + formatCurrency(objReq.grandTotal) + '</td></tr>';
		}).join('');

		return '<div class="consolidate-modal-summary">' +
			'<strong>' + intTotal + '</strong> budget request' + (intTotal === 1 ? '' : 's') + ' eligible for consolidation · Combined total <strong>' + formatCurrency(dblGrand) + '</strong>' +
		'</div>' +
		'<div class="br-table-wrap"><table class="br-table"><thead><tr>' +
			'<th>Reference No.</th><th>Title</th><th>Agency Name</th><th>Agency Category</th><th class="text-end">Grand Total</th>' +
		'</tr></thead><tbody>' + strRows + '</tbody></table></div>';
	}

	function openConsolidateModal()
	{
		document.getElementById('consolidate-modal-body').innerHTML = renderConsolidateModalBody();
		if (!consolidateModal) consolidateModal = new bootstrap.Modal(document.getElementById('consolidate-modal'));
		consolidateModal.show();
	}

	function renderPage()
	{
		if (state.view === 'list')
		{
			elListView.classList.remove('d-none');
			elDetailView.classList.add('d-none');
			document.title = 'Unified Budget — Prototype';
			renderListView();
			bindListEvents();
			return;
		}

		elListView.classList.add('d-none');
		elDetailView.classList.remove('d-none');
		renderDetailPage();
	}

	document.getElementById('btn-create-unified-budget').onclick = function()
	{
		var arrIds = ELIGIBLE_BUDGET_REQUESTS.map(function(r) { return r.id; });
		if (consolidateModal) consolidateModal.hide();
		openNewUnifiedBudget(arrIds);
	};

	renderPage();
})();
