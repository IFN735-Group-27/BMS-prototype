/**
*System Name: Budget Management System
*Module Name: budget_request_app
*
*Purpose of this file:
*Budget Request list and detail wizard prototype application logic.
*
*Author: none
*
*Copyright (C) 2026
*by the Department of Science and Technology - Central Office
*
*All rights reserved.
*/

(function budgetRequestDetailPrototype()
{
	'use strict';

	/* -- Constants ----------------------------- */
	var WIZARD_STEP_GENERAL = 1;
	var WIZARD_STEP_PROJECTS = 2;
	var WIZARD_STEP_ATTACHMENTS = 3;
	var WIZARD_STEP_REVIEW = 4;
	var WIZARD_STEP_HISTORY = 5;
	var WIZARD_STEP_VERSIONING = 6;

	var WORKFLOW_STORAGE_KEY = 'bms_br_workflow_state';

	var REVIEW_STAGE_CHAIN = [
		{ id: 'pdo', currentStage: 'PDO Review' },
		{ id: 'fo', currentStage: 'FO Review' }
	];

	var READY_FOR_CONSOLIDATION = {
		id: 'ready',
		currentStage: 'Ready for Consolidation'
	};

	var PROJECT_STEP_INFO = 'info';
	var PROJECT_STEP_MEASURES = 'measures';
	var PROJECT_STEP_BUDGET = 'budget';

	var ALLOTMENT_CASES = ['PS', 'MOOE', 'CO'];

	var LIST_PAGE_SIZE = 5;

	var CURRENT_ACTOR_NAME = 'Maria Santos';

	var LIST_STAGE_OPTIONS = [
		'Agency Name',
		'PDO Review',
		'FO Review',
		'Ready for Consolidation',
		'Consolidated to Unified Budget'
	];

	var LIST_STATUS_OPTIONS = [
		'Draft',
		'Pending',
		'Returned',
		'Reviewed',
		'Validated',
		'Cancelled'
	];



	function getExpenseItemOptions(strCategory)
	{
		return EXPENSE_ITEM_CATALOG[strCategory] || [];
	}

	function getExpenseItemLabel(strCategory, strValue)
	{
		var arrOptions = getExpenseItemOptions(strCategory);

		for (var intIdx = 0; intIdx < arrOptions.length; intIdx++)
		{
			if (arrOptions[intIdx].value === strValue)
			{
				return arrOptions[intIdx].label;
			}
		}

		return strValue;
	}

	function getLineItemDisplayLabel(objItem)
	{
		if (String(objItem.category).toUpperCase() === 'CO')
		{
			return String(objItem.description || '').trim();
		}

		if (objItem.expenseItemValue)
		{
			return getExpenseItemLabel(objItem.category, objItem.expenseItemValue);
		}

		return String(objItem.description || '').trim();
	}

	function syncExpenseModalFields()
	{
		var strCat = document.getElementById('expense-category').value;
		var elItemField = document.getElementById('expense-item-field');
		var elDescField = document.getElementById('expense-description-field');
		var elSelect = document.getElementById('expense-item-select');

		if (strCat === 'CO')
		{
			elItemField.classList.add('d-none');
			elDescField.classList.remove('d-none');
		}
		else
		{
			elItemField.classList.remove('d-none');
			elDescField.classList.add('d-none');

			var strOptions = '<option value="">Select expense item</option>';

			getExpenseItemOptions(strCat).forEach(function(objOpt)
			{
				strOptions += '<option value="' + escapeHtml(objOpt.value) + '">' + escapeHtml(objOpt.label) + '</option>';
			});

			elSelect.innerHTML = strOptions;
		}
	}

	function openExpenseModalForAdd()
	{
		state.editingExpenseId = null;
		document.getElementById('expense-description').value = '';
		document.getElementById('expense-item-select').value = '';
		document.getElementById('expense-amount').value = '';
		document.getElementById('expense-category').value = 'PS';
		syncExpenseModalFields();
		expenseModal.show();
	}

	function openExpenseModalForEdit(objItem)
	{
		state.editingExpenseId = objItem.id;
		document.getElementById('expense-category').value = objItem.category;
		document.getElementById('expense-amount').value = objItem.amount;
		syncExpenseModalFields();

		if (String(objItem.category).toUpperCase() === 'CO')
		{
			document.getElementById('expense-description').value = objItem.description || '';
		}
		else
		{
			document.getElementById('expense-item-select').value = objItem.expenseItemValue || '';
		}

		expenseModal.show();
	}

	
	
	/* -- Sample data ----------------------------- */
	var sampleBudgetRequest = {
		id: null,
		referenceCode: 'Will be generated after save',
		title: 'FY 2027 R&D Capacity Building Program',
		fiscalYear: '2027',
		requestingUnit: REQUESTING_UNIT_PCIEERD,
		agencyCategory: 'Sectoral Council',
		description: 'Consolidated budget request for research and development capacity building initiatives across priority sectors.',
		status: 'draft',
		currentStage: 'Agency Name',
		submittedBy: null,
		submittedAt: null,
		reviewHistory: [],
		returnReason: null,
		workflowStage: null
	};

	var sampleProjects = [
		{
			id: 'proj-1',
			name: 'Advanced Materials R&D',
			programName: 'Materials Science Program',
			pillarCategory: 'Human well-being',
			description: 'Development of advanced composite materials for industrial applications.',
			physicalMeasures: (function() {
				var arr = createEmptyPhysicalMeasures();
				// Chỉ thêm data mẫu cho measure cần demo
				arr[0].expanded = true;  // publication
				arr[0].entries.push({
					id: 'entry-1',
					particularValue: 'intl-peer-reviewed',
					quantity: 2,
					specification: 'Paper on composite materials...',
					othersText: ''
				});
				return arr;
			})() ,
			lineItems: [
				{ id: 'li-1', category: 'PS', expenseItemValue: 'salaries', description: 'Salaries', amount: 2500000, justification: 'Required to retain core R&D personnel for materials science program delivery.' },
				{ id: 'li-2', category: 'MOOE', expenseItemValue: 'supplies-materials', description: 'Supplies and Materials Expenses', amount: 850000, justification: 'Laboratory consumables and testing materials for composite development.' },
				{ id: 'li-3', category: 'CO', expenseItemValue: '', description: 'Spectroscopy equipment', amount: 3200000, justification: 'Capital equipment needed for advanced materials characterization.' }
			]
		},
		{
			id: 'proj-2',
			name: 'Green Energy Pilot Plant',
			programName: 'Renewable Energy Initiative',
			pillarCategory: 'Wealth creation fostered',
			description: 'Pilot-scale renewable energy demonstration facility.',
			physicalMeasures: (function()
			{
				var arr = createEmptyPhysicalMeasures();
				var objProduct = arr.find(function(m) { return m.measureId === 'product'; });
				if (objProduct)
				{
					objProduct.expanded = true;
					objProduct.entries.push({
						id: 'entry-2',
						particularValue: 'functional-prototype',
						quantity: 1,
						specification: '50kW solar-wind hybrid pilot plant',
						othersText: ''
					});
				}
				return arr;
			})(),
			lineItems: [
				{ id: 'li-4', category: 'PS', expenseItemValue: 'honoraria', description: 'Honoraria', amount: 1200000, justification: 'Honoraria for pilot plant technical advisers and subject matter experts.' },
				{ id: 'li-5', category: 'MOOE', expenseItemValue: 'utility-expenses', description: 'Utility Expenses', amount: 450000, justification: 'Utility costs for operating the renewable energy pilot facility.' },
				{ id: 'li-6', category: 'CO', expenseItemValue: '', description: 'Solar panel arrays', amount: 1800000, justification: 'Solar arrays required for hybrid pilot plant demonstration.' }
			]
		}
	];

	var sampleVersions = [];


	/* -- Application state ----------------------- */
	var state = {
		view: 'list',
		listFilters: {
			search: '',
			fiscalYear: '',
			status: '',
			stage: ''
		},
		listAppliedFilters: {
			search: '',
			fiscalYear: '',
			status: '',
			stage: ''
		},
		listCurrentPage: 1,
		listSortKey: 'lastUpdated',
		listSortDir: 'desc',
		openActionMenuId: null,
		selectedListRequestId: null,
		wizardStep: WIZARD_STEP_GENERAL,
		selectedProjectId: sampleProjects[0].id,
		projectMiniStep: PROJECT_STEP_INFO,
		summaryPanelVisible: true,
		editingExpenseId: null,
		versionProjectExpanded: {},
		versionExpanded: {},
		attachedFiles: [],
		justificationPosts: [],
		justificationDraft: '',
		form: {
			title: sampleBudgetRequest.title,
			fiscalYear: sampleBudgetRequest.fiscalYear,
			description: sampleBudgetRequest.description
		}
	};

	var projects = JSON.parse(JSON.stringify(sampleProjects));

	/* -- DOM references --------------------------- */
	var elDetailHeader = document.getElementById('br-detail-header');
	var elWizardStepper = document.getElementById('br-wizard-stepper');
	var elDetailBody = document.getElementById('br-detail-body');
	var elWizardContent = document.getElementById('br-wizard-content');
	var elContextPanel = document.getElementById('br-context-panel');
	var elDetailFooter = document.getElementById('br-detail-footer');
	var elPageTitle = document.getElementById('br-page-title');
	var elListView = document.getElementById('br-list-view');
	var elDetailView = document.getElementById('br-detail-view');
	var expenseModal = null;

	/* -- Utilities -------------------------------- */
	var escapeHtml = PrototypeUi.escapeHtml;
	var formatCurrency = PrototypeUi.formatCurrency;
	var formatTimestamp = PrototypeUi.formatTimestamp;

	function formatFileSize(intBytes)
	{
		var num = Number(intBytes) || 0;
		if (num < 1024) return num + ' B';
		if (num < 1048576) return (num / 1024).toFixed(1) + ' KB';
		return (num / 1048576).toFixed(1) + ' MB';
	}

	function getCurrentActorName()
	{
		return CURRENT_ACTOR_NAME;
	}

	function getCurrentTimestampIso()
	{
		return new Date().toISOString();
	}

	function normalizeJustificationPost(objEntry, intIndex)
	{
		return {
			id: objEntry.id || ('just-' + Date.now() + '-' + intIndex),
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
		return '<div class="br-attachment-card__meta mt-1">' + escapeHtml(strParts.join(' · ')) + '</div>';
	}

	function loadAttachmentsForRequest(strListRequestId)
	{
		var objPreset = REQUEST_ATTACHMENTS[strListRequestId] || { attachedFiles: [], justificationPosts: [] };
		state.attachedFiles = JSON.parse(JSON.stringify(objPreset.attachedFiles || []));
		state.justificationPosts = JSON.parse(JSON.stringify(
			normalizeJustificationPosts(objPreset.justificationPosts || objPreset.justification)
		));
		state.justificationDraft = '';
	}

	function hasAttachedFiles()
	{
		return state.attachedFiles.length > 0;
	}

	function hasJustification()
	{
		return state.justificationPosts.length > 0;
	}

	function postJustification()
	{
		if (!canEditAttachmentsJustification())
		{
			return;
		}

		var strDraft = String(state.justificationDraft || '').trim();
		if (!strDraft)
		{
			window.alert('Please enter justification before posting.');
			return;
		}

		state.justificationPosts.push({
			id: 'just-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
			text: strDraft,
			postedAt: getCurrentTimestampIso(),
			postedBy: getCurrentActorName()
		});
		state.justificationDraft = '';

		if (state.selectedListRequestId)
		{
			syncListItemFromRequest();
		}

		renderPage();
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

	function isAttachmentsStepComplete()
	{
		return hasAttachedFiles() || hasJustification();
	}

	function getSelectedProject()
	{
		var objFound = projects.find(function(objProject)
		{
			return objProject.id === state.selectedProjectId;
		});
		if (objFound) return objFound;
		if (projects.length > 0) return projects[0];
		return {
			id: 'proj-empty',
			name: '',
			programName: '',
			pillarCategory: '',
			description: '',
			physicalMeasures: createEmptyPhysicalMeasures(),
			lineItems: []
		};
	}

	function countPhysicalMeasures(objProject)
	{
		var intCount = 0;
		(objProject.physicalMeasures || []).forEach(function(objMeasure)
		{
			intCount += (objMeasure.entries || []).filter(function(objEntry)
			{
				return isPhysicalMeasureEntryComplete(objEntry);
			}).length;
		});
		return intCount;
	}

	function isPhysicalMeasureEntryComplete(objEntry)
	{
		if (!objEntry.particularValue || Number(objEntry.quantity) <= 0)
		{
			return false;
		}

		if (String(objEntry.specification || '').trim() === '')
		{
			return false;
		}

		if (objEntry.particularValue === 'others' && String(objEntry.othersText || '').trim() === '')
		{
			return false;
		}

		return true;
	}

	function projectHasCompletePhysicalMeasure(objProject)
	{
		return (objProject.physicalMeasures || []).some(function(objMeasure)
		{
			return (objMeasure.entries || []).some(isPhysicalMeasureEntryComplete);
		});
	}

	function isProjectCoreInfoComplete(objProject)
	{
		return String(objProject.name || '').trim() !== ''
			&& String(objProject.programName || '').trim() !== ''
			&& String(objProject.pillarCategory || '').trim() !== '';
	}

	function projectHasExpenseItem(objProject)
	{
		return (objProject.lineItems || []).some(function(objItem)
		{
			return Number(objItem.amount) > 0;
		});
	}

	function isProjectComplete(objProject)
	{
		return isProjectCoreInfoComplete(objProject)
			&& projectHasCompletePhysicalMeasure(objProject)
			&& projectHasExpenseItem(objProject);
	}

	function getProjectCompletionStatus(objProject)
	{
		return isProjectComplete(objProject) ? 'complete' : 'incomplete';
	}

	function isGeneralInformationComplete()
	{
		return String(state.form.title || '').trim() !== ''
			&& String(state.form.fiscalYear || '').trim() !== ''
			&& String(state.form.description || '').trim() !== '';
	}

	function buildCompletionChecklist()
	{
		var blnHasProjects = projects.length > 0;
		var blnAllProjectInfo = blnHasProjects && projects.every(isProjectCoreInfoComplete);
		var blnAllMeasures = blnHasProjects && projects.every(projectHasCompletePhysicalMeasure);
		var blnAllLineItems = blnHasProjects && projects.every(projectHasExpenseItem);

		return [
			{
				id: 'general',
				label: 'General information complete',
				complete: isGeneralInformationComplete()
			},
			{
				id: 'projects',
				label: 'At least one project added',
				complete: blnHasProjects
			},
			{
				id: 'project-info',
				label: 'Project must have project info',
				complete: blnAllProjectInfo
			},
			{
				id: 'physical-measures',
				label: 'Project must have at least one physical measure',
				complete: blnAllMeasures
			},
			{
				id: 'line-budget',
				label: 'Project must have at least one line item budget',
				complete: blnAllLineItems
			}
		];
	}

	function renderCompletionChecklist()
	{
		var arrItems = buildCompletionChecklist();
		var strHtml = '<div class="br-completion-checklist" role="list">';

		arrItems.forEach(function(objItem)
		{
			var strItemClass = objItem.complete ? 'br-checklist__item--complete' : 'br-checklist__item--pending';
			var strIconClass = objItem.complete ? 'br-checklist__icon--complete' : 'br-checklist__icon--pending';
			var strIconContent = objItem.complete ? PrototypeUi.SVG_CHECK : PrototypeUi.SVG_TRASH;

			strHtml += '<div class="br-checklist__item ' + strItemClass + '" role="listitem">';
			strHtml += '<span class="br-checklist__icon ' + strIconClass + '" aria-hidden="true">' + strIconContent + '</span>';
			strHtml += '<span class="br-checklist__label">' + escapeHtml(objItem.label) + '</span>';
			strHtml += '</div>';
		});

		strHtml += '</div>';
		return strHtml;
	}

	function renderCompletionChecklistCard()
	{
		return '<div class="br-card br-completion-checklist-card">' +
			'<p class="fw-bold text-uppercase section-eyebrow mb-3">Requirements Checklist</p>' +
			renderCompletionChecklist() +
		'</div>';
	}

	function computeProjectTotals(objProject)
	{
		var objTotals = { PS: 0, MOOE: 0, CO: 0, grand: 0 };
		(objProject.lineItems || []).forEach(function(objItem)
		{
			var strCat = String(objItem.category || '').toUpperCase();
			var dblAmt = Number(objItem.amount) || 0;
			if (objTotals[strCat] !== undefined)
			{
				objTotals[strCat] += dblAmt;
			}
			objTotals.grand += dblAmt;
		});
		return objTotals;
	}

	function computeRequestTotals()
	{
		var objTotals = { PS: 0, MOOE: 0, CO: 0, grand: 0 };
		projects.forEach(function(objProject)
		{
			var objProjectTotals = computeProjectTotals(objProject);
			objTotals.PS += objProjectTotals.PS;
			objTotals.MOOE += objProjectTotals.MOOE;
			objTotals.CO += objProjectTotals.CO;
			objTotals.grand += objProjectTotals.grand;
		});
		return objTotals;
	}

	function isVersioningVisible()
	{
		return sampleVersions.length > 0;
	}

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

	function isReviewStageName(strStage)
	{
		var strNorm = String(strStage || '').toLowerCase();
		return strNorm.indexOf('pdo review') >= 0 ||
			strNorm.indexOf('fo review') >= 0 ||
			strNorm.indexOf('ready for consolidation') >= 0;
	}

	function normalizeBudgetListItem(objItem)
	{
		if (!objItem) return;

		var strStatus = normalizeRequestStatus(objItem.status);

		if (objItem.isDraft || strStatus === 'draft')
		{
			objItem.status = 'Draft';
			objItem.isDraft = true;
			objItem.currentStage = 'Agency Name';
			return;
		}

		objItem.isDraft = false;

		if (strStatus === 'pending' && !isReviewStageName(objItem.currentStage))
		{
			objItem.currentStage = 'PDO Review';
		}
	}

	function loadStoredWorkflowState()
	{
		var objAll = JSON.parse(localStorage.getItem(WORKFLOW_STORAGE_KEY) || '{}');
		Object.keys(objAll).forEach(function(strId)
		{
			var objStored = objAll[strId];
			var objListItem = BUDGET_REQUESTS_LIST.find(function(item) { return item.id === strId; });
			if (objListItem)
			{
				if (!objListItem.isDraft)
				{
					if (objStored.status) objListItem.status = objStored.status;
					if (objStored.currentStage) objListItem.currentStage = objStored.currentStage;
					if (objStored.lastUpdated) objListItem.lastUpdated = objStored.lastUpdated;
				}
			}
			if (!objListItem || !objListItem.isDraft)
			{
				if (objStored.reviewHistory) REQUEST_REVIEW_HISTORY[strId] = objStored.reviewHistory;
				if (objStored.returnReason !== undefined) REQUEST_RETURN_REASON[strId] = objStored.returnReason;
				if (objStored.workflowStage) REQUEST_WORKFLOW_STAGE[strId] = objStored.workflowStage;
			}
		});

		BUDGET_REQUESTS_LIST.forEach(function(objItem)
		{
			normalizeBudgetListItem(objItem);
		});
	}

	function applyWorkflowMetaToRequest(strListRequestId)
	{
		sampleBudgetRequest.reviewHistory = JSON.parse(JSON.stringify(REQUEST_REVIEW_HISTORY[strListRequestId] || []));
		sampleBudgetRequest.returnReason = REQUEST_RETURN_REASON[strListRequestId] || null;
		sampleBudgetRequest.workflowStage = REQUEST_WORKFLOW_STAGE[strListRequestId] || null;
	}

	function loadRequestDetailForListItem(objListItem)
	{
		projects = JSON.parse(JSON.stringify(sampleProjects));
		state.selectedProjectId = projects.length > 0 ? projects[0].id : null;
		state.projectMiniStep = PROJECT_STEP_INFO;
		state.summaryPanelVisible = true;
		state.justificationDraft = '';

		var objPreset = REQUEST_FORM_PRESETS[objListItem.id];
		if (objPreset)
		{
			state.form.title = objPreset.title;
			state.form.description = objPreset.description;
			state.form.fiscalYear = objPreset.fiscalYear || objListItem.fiscalYear;
		}
		else
		{
			state.form.title = sampleBudgetRequest.title;
			state.form.description = sampleBudgetRequest.description;
			state.form.fiscalYear = objListItem.fiscalYear || sampleBudgetRequest.fiscalYear;
		}

		sampleBudgetRequest.title = state.form.title;
		sampleBudgetRequest.description = state.form.description;
		sampleBudgetRequest.fiscalYear = state.form.fiscalYear;
		if (objListItem.requestingUnit)
		{
			sampleBudgetRequest.requestingUnit = objListItem.requestingUnit;
		}
		else if (objPreset && objPreset.requestingUnit)
		{
			sampleBudgetRequest.requestingUnit = objPreset.requestingUnit;
		}
	}

	function getReviewHistory()
	{
		return sampleBudgetRequest.reviewHistory || [];
	}

	function isReviewHistoryVisible()
	{
		return getReviewHistory().length > 0;
	}

	function isBudgetRequestTabMode()
	{
		return normalizeRequestStatus(sampleBudgetRequest.status) !== 'draft';
	}

	function getBudgetRequestStepDefinitions()
	{
		return [
			{ id: WIZARD_STEP_GENERAL, wizardLabel: '1. General Information', tabLabel: 'General Information' },
			{ id: WIZARD_STEP_PROJECTS, wizardLabel: '2. Projects & Budget', tabLabel: 'Projects & Budget' },
			{ id: WIZARD_STEP_ATTACHMENTS, wizardLabel: '3. Attachments & Justification', tabLabel: 'Attachments & Justification' },
			{ id: WIZARD_STEP_REVIEW, wizardLabel: '4. Review & Submit', tabLabel: 'Review & Submit' },
			{ id: WIZARD_STEP_HISTORY, wizardLabel: '5. Review History', tabLabel: 'Review History', hidden: !isReviewHistoryVisible() },
			{ id: WIZARD_STEP_VERSIONING, wizardLabel: '6. Versioning', tabLabel: 'Versioning', hidden: !isVersioningVisible() }
		];
	}

	function normalizeRequestStatus(strStatus)
	{
		return String(strStatus || 'draft').toLowerCase().trim();
	}

	function isEditableStatus(strStatus)
	{
		var strNorm = normalizeRequestStatus(strStatus);
		return strNorm === 'draft' || strNorm === 'returned';
	}

	function isRequestEditable()
	{
		return isEditableStatus(sampleBudgetRequest.status);
	}

	function isRequestLocked()
	{
		return !isRequestEditable();
	}

	function isRequestReturned()
	{
		return normalizeRequestStatus(sampleBudgetRequest.status) === 'returned';
	}

	//a request can be cancelled before it reaches a completed workflow state
	function canCancelRequest()
	{
		var strNorm = normalizeRequestStatus(sampleBudgetRequest.status);

		return strNorm === 'draft' ||
			strNorm === 'returned' ||
			strNorm === 'pending' ||
			strNorm === 'submitted';
	}

	//this function cancels the current budget request after user confirmation
	function cancelBudgetRequest()
	{
		var strNow = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });

		if (!canCancelRequest())
		{
			return;
		}

		if (!window.confirm('Cancel this budget request? This action cannot be undone.'))
		{
			return;
		}

		if (!sampleBudgetRequest.reviewHistory) sampleBudgetRequest.reviewHistory = [];
		sampleBudgetRequest.reviewHistory.push({
			date: strNow,
			user: CURRENT_ACTOR_NAME,
			role: 'Requester',
			action: 'Cancelled',
			reason: '-',
			target: 'Entire Request',
			remark: 'Request cancelled by the agency.'
		});
		sampleBudgetRequest.status = 'Cancelled';
		syncListItemFromRequest();
		window.alert('Budget request cancelled.');
		openListView();
	}

	function getReturnReason()
	{
		return sampleBudgetRequest.returnReason || null;
	}

	function isClarificationOnlyEdit()
	{
		return isRequestReturned() && getReturnReason() === 'For Clarification';
	}

	function canEditGeneralAndProjects()
	{
		if (!isRequestEditable()) return false;
		if (normalizeRequestStatus(sampleBudgetRequest.status) === 'draft') return true;
		if (isRequestReturned() && !isClarificationOnlyEdit()) return true;
		return false;
	}

	function canEditAttachmentsJustification()
	{
		return isRequestEditable();
	}

	function getReadOnlyAttr()
	{
		return canEditGeneralAndProjects() ? '' : ' readonly';
	}

	function getDisabledAttr()
	{
		return canEditGeneralAndProjects() ? '' : ' disabled';
	}

	function getAttachmentsReadOnlyAttr()
	{
		return canEditAttachmentsJustification() ? '' : ' readonly';
	}

	function renderReadOnlyBanner()
	{
		var strStatus = normalizeRequestStatus(sampleBudgetRequest.status);
		var strModifier = '';
		var strMessage = '';

		if (strStatus === 'draft')
		{
			return '';
		}

		if (strStatus === 'returned')
		{
			strModifier = ' br-readonly-banner--returned';
			if (getReturnReason() === 'For Clarification')
			{
				strMessage = 'This budget request is return for clarification. please input justification.';
			}
			else
			{
				strMessage = 'This budget request is return for revision. please correct request and resubmit.';
			}
		}
		else if (strStatus === 'reviewed')
		{
			strModifier = ' br-readonly-banner--reviewed';
			strMessage = 'This budget request is reviewed successfully. Reviewed requests cannot be edited.';
		}
		else if (strStatus === 'pending')
		{
			strModifier = ' br-readonly-banner--pending';
			strMessage = 'This budget request is pending for review. Submitted and resubmitted requests cannot be edited until they are returned.';
		}
		else
		{
			strModifier = ' br-readonly-banner--pending';
			strMessage = 'This budget request is pending for review. Submitted and resubmitted requests cannot be edited until they are returned.';
		}

		return '<div class="br-readonly-banner' + strModifier + '">' + escapeHtml(strMessage) + '</div>';
	}

	function wrapWizardStepWithBanner(strStepHtml)
	{
		return renderReadOnlyBanner() + strStepHtml;
	}

	function syncListItemFromRequest()
	{
		if (!state.selectedListRequestId) return;
		var objListItem = BUDGET_REQUESTS_LIST.find(function(item) { return item.id === state.selectedListRequestId; });
		if (!objListItem) return;
		objListItem.referenceNo = sampleBudgetRequest.referenceCode;
		objListItem.fiscalYear = state.form.fiscalYear;
		objListItem.projectCount = projects.length;
		objListItem.grandTotal = computeRequestTotals().grand;
		objListItem.status = sampleBudgetRequest.status;
		objListItem.isDraft = normalizeRequestStatus(sampleBudgetRequest.status) === 'draft';
		if (objListItem.isDraft)
		{
			objListItem.status = 'Draft';
			objListItem.currentStage = 'Agency Name';
			sampleBudgetRequest.currentStage = 'Agency Name';
			sampleBudgetRequest.workflowStage = null;
		}
		else
		{
			objListItem.currentStage = sampleBudgetRequest.currentStage || objListItem.currentStage;
		}
		normalizeBudgetListItem(objListItem);
		objListItem.lastUpdated = new Date().toISOString();
		REQUEST_VERSIONS[state.selectedListRequestId] = JSON.parse(JSON.stringify(sampleVersions));
		REQUEST_ATTACHMENTS[state.selectedListRequestId] = {
			attachedFiles: JSON.parse(JSON.stringify(state.attachedFiles)),
			justificationPosts: JSON.parse(JSON.stringify(state.justificationPosts))
		};
		if (state.selectedListRequestId)
		{
			REQUEST_REVIEW_HISTORY[state.selectedListRequestId] = JSON.parse(JSON.stringify(sampleBudgetRequest.reviewHistory || []));
			REQUEST_RETURN_REASON[state.selectedListRequestId] = sampleBudgetRequest.returnReason || null;
			REQUEST_WORKFLOW_STAGE[state.selectedListRequestId] = sampleBudgetRequest.workflowStage || null;
			saveWorkflowState(state.selectedListRequestId, {
				status: objListItem.status,
				currentStage: objListItem.currentStage,
				workflowStage: sampleBudgetRequest.workflowStage,
				returnReason: sampleBudgetRequest.returnReason || null,
				reviewHistory: sampleBudgetRequest.reviewHistory || [],
				lastUpdated: objListItem.lastUpdated
			});
		}
	}

	function getStatusBadgeClass(strStatus)
	{
		var strNorm = String(strStatus || 'draft').toLowerCase();
		if (strNorm === 'draft') return 'status-badge--draft';
		if (strNorm.indexOf('reviewed') >= 0) return 'status-badge--validated';
		if (strNorm.indexOf('validated') >= 0) return 'status-badge--validated';
		if (strNorm.indexOf('returned') >= 0) return 'status-badge--returned';
		if (strNorm.indexOf('pending') >= 0) return 'status-badge--pending';
		if (strNorm === 'submitted') return 'status-badge--submitted';
		if (strNorm === 'complete') return 'status-badge--complete';
		if (strNorm.indexOf('incomplete') >= 0) return 'status-badge--incomplete';
		if (strNorm.indexOf('cancel') >= 0) return 'status-badge--cancelled';
		return 'status-badge--draft';
	}

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

	function renderSortIndicator(strKey, strActiveKey, strDir)
	{
		if (strActiveKey !== strKey) return '';
		return strDir === 'asc' ? ' ↑' : ' ↓';
	}

	function sortListRequests(arrItems)
	{
		var strKey = state.listSortKey;
		var intDir = state.listSortDir === 'asc' ? 1 : -1;

		return arrItems.slice().sort(function(objA, objB)
		{
			var valA = objA[strKey];
			var valB = objB[strKey];

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

	function getFilteredListRequests()
	{
		var f = state.listAppliedFilters;
		return BUDGET_REQUESTS_LIST.filter(function(objItem)
		{
			var strSearch = f.search.toLowerCase().trim();
			var blnSearch = !strSearch || objItem.referenceNo.toLowerCase().indexOf(strSearch) >= 0;
			var blnYear = !f.fiscalYear || objItem.fiscalYear === f.fiscalYear;
			var blnStatus = !f.status || objItem.status === f.status;
			var blnStage = !f.stage || objItem.currentStage === f.stage;
			return blnSearch && blnYear && blnStatus && blnStage;
		});
	}

	function getPaginatedListRequests()
	{
		var arrFiltered = sortListRequests(getFilteredListRequests());
		var intTotal = arrFiltered.length;
		var intStart = (state.listCurrentPage - 1) * LIST_PAGE_SIZE;
		return {
			items: arrFiltered.slice(intStart, intStart + LIST_PAGE_SIZE),
			total: intTotal
		};
	}

	function applyListFilters()
	{
		state.listAppliedFilters = {
			search: state.listFilters.search,
			fiscalYear: state.listFilters.fiscalYear,
			status: state.listFilters.status,
			stage: state.listFilters.stage
		};
		state.listCurrentPage = 1;
		renderPage();
	}

	function clearListFilters()
	{
		var empty = { search: '', fiscalYear: '', status: '', stage: '' };
		state.listFilters = { search: '', fiscalYear: '', status: '', stage: '' };
		state.listAppliedFilters = { search: '', fiscalYear: '', status: '', stage: '' };
		state.listCurrentPage = 1;
		renderPage();
	}

	function openDetailView(strListRequestId, blnPreferEditStep)
	{
		state.view = 'detail';
		state.selectedListRequestId = strListRequestId || null;
		state.versionExpanded = {};

		if (strListRequestId)
		{
			var objListItem = BUDGET_REQUESTS_LIST.find(function(item) { return item.id === strListRequestId; });
			if (objListItem)
			{
				normalizeBudgetListItem(objListItem);
				loadRequestDetailForListItem(objListItem);
				sampleBudgetRequest.id = 1;
				sampleBudgetRequest.referenceCode = objListItem.referenceNo;
				sampleBudgetRequest.status = objListItem.isDraft ? 'draft' : objListItem.status;
				sampleBudgetRequest.currentStage = objListItem.currentStage;
				sampleBudgetRequest.fiscalYear = objListItem.fiscalYear;
				if (objListItem.requestingUnit)
				{
					sampleBudgetRequest.requestingUnit = objListItem.requestingUnit;
				}
				sampleVersions = JSON.parse(JSON.stringify(REQUEST_VERSIONS[strListRequestId] || []));
				loadAttachmentsForRequest(strListRequestId);
				applyWorkflowMetaToRequest(strListRequestId);
				sampleVersions.forEach(function(objVersion)
				{
					if (!objVersion.snapshot.projects || objVersion.snapshot.projects.length === 0)
					{
						objVersion.snapshot.projects = JSON.parse(JSON.stringify(projects));
					}
				});
				if (blnPreferEditStep && (objListItem.isDraft || isEditableStatus(objListItem.status)))
				{
					state.wizardStep = WIZARD_STEP_GENERAL;
				}
				else if (sampleVersions.length > 0)
				{
					state.wizardStep = WIZARD_STEP_VERSIONING;
				}
				else if (isReviewHistoryVisible())
				{
					state.wizardStep = WIZARD_STEP_HISTORY;
				}
				else
				{
					state.wizardStep = WIZARD_STEP_REVIEW;
				}
			}
		}
		else
		{
			projects = [createBlankProject()];
			state.selectedProjectId = projects[0].id;
			state.projectMiniStep = PROJECT_STEP_INFO;
			state.form.title = '';
			state.form.fiscalYear = '2027';
			state.form.description = '';
			sampleBudgetRequest.id = null;
			sampleBudgetRequest.referenceCode = 'Will be generated after save';
			sampleBudgetRequest.status = 'draft';
			sampleBudgetRequest.currentStage = 'Agency Name';
			sampleBudgetRequest.submittedBy = null;
			sampleBudgetRequest.submittedAt = null;
			sampleBudgetRequest.reviewHistory = [];
			sampleBudgetRequest.returnReason = null;
			sampleBudgetRequest.workflowStage = null;
			sampleVersions = [];
			state.attachedFiles = [];
			state.justificationPosts = [];
			state.justificationDraft = '';
			state.wizardStep = WIZARD_STEP_GENERAL;
		}

		renderPage();
	}

	function openListView()
	{
		state.view = 'list';
		state.selectedListRequestId = null;
		renderPage();
	}

	function renderListView()
	{
		var objPage = getPaginatedListRequests();
		var intLastPage = Math.max(1, Math.ceil(objPage.total / LIST_PAGE_SIZE));
		if (state.listCurrentPage > intLastPage) state.listCurrentPage = intLastPage;

		function renderActionMenu(objRow)
		{
			var blnOpen = state.openActionMenuId === objRow.id;
			var blnCanEdit = objRow.isDraft || isEditableStatus(objRow.status);
			var strItems = '<button type="button" class="ub-action-menu__item" data-action="view" data-id="' + escapeHtml(objRow.id) + '">View</button>';
			if (blnCanEdit)
			{
				strItems += '<button type="button" class="ub-action-menu__item" data-action="edit" data-id="' + escapeHtml(objRow.id) + '">Edit</button>';
			}
			return '<div class="ub-action-menu">' +
				'<button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle" data-toggle-actions="' + escapeHtml(objRow.id) + '">Actions</button>' +
				'<div class="ub-action-menu__menu' + (blnOpen ? ' ub-action-menu__menu--open' : '') + '">' + strItems + '</div>' +
			'</div>';
		}

		var strRows = objPage.items.map(function(objItem)
		{
			normalizeBudgetListItem(objItem);

			return '<tr>' +
				'<td class="fw-semibold">' + escapeHtml(objItem.referenceNo) + '</td>' +
				'<td>' + escapeHtml(objItem.fiscalYear) + '</td>' +
				'<td>' + objItem.projectCount + ' project' + (objItem.projectCount === 1 ? '' : 's') + '</td>' +
				'<td class="text-end fw-semibold">' + formatCurrency(objItem.grandTotal) + '</td>' +
				'<td><span class="status-badge status-badge--stage">' + escapeHtml(objItem.currentStage) + '</span></td>' +
				'<td><span class="status-badge ' + getStatusBadgeClass(objItem.status) + '">' + escapeHtml(objItem.status) + '</span></td>' +
				'<td>' + escapeHtml(formatTimestamp(objItem.lastUpdated)) + '</td>' +
				'<td>' + renderActionMenu(objItem) + '</td>' +
			'</tr>';
		}).join('');

		if (!strRows)
		{
			strRows = '<tr><td colspan="8" class="text-center text-muted py-4">No budget requests match the current filters.</td></tr>';
		}

		var intFrom = objPage.total === 0 ? 0 : ((state.listCurrentPage - 1) * LIST_PAGE_SIZE) + 1;
		var intTo = Math.min(state.listCurrentPage * LIST_PAGE_SIZE, objPage.total);

		elListView.innerHTML =
			'<div class="br-list-page">' +
				'<header class="br-list-page__header">' +
					'<div>' +
						'<h1>Budget Requests</h1>' +
						'<p>View and manage all budget requests for your agency.</p>' +
					'</div>' +
					'<button type="button" class="btn btn-primary btn-sm fw-semibold" id="btn-new-request">+ New Budget Request</button>' +
				'</header>' +
				'<div class="br-card">' +
					'<div class="br-filters">' +
						'<div><label class="form-label small" for="filter-search">Search</label><input type="search" class="form-control form-control-sm" id="filter-search" placeholder="Reference number" value="' + escapeHtml(state.listFilters.search) + '"></div>' +
						'<div><label class="form-label small" for="filter-year">Fiscal Year</label><select class="form-select form-select-sm" id="filter-year">' + renderSelectOptions(['2027', '2026'], state.listFilters.fiscalYear) + '</select></div>' +
						'<div><label class="form-label small" for="filter-status">Status</label><select class="form-select form-select-sm" id="filter-status">' + renderSelectOptions(LIST_STATUS_OPTIONS, state.listFilters.status) + '</select></div>' +
						'<div><label class="form-label small" for="filter-stage">Current Stage</label><select class="form-select form-select-sm" id="filter-stage">' + renderSelectOptions(LIST_STAGE_OPTIONS, state.listFilters.stage) + '</select></div>' +
						'<div class="br-filter-actions">' +
							'<button type="button" class="btn btn-primary btn-sm" id="btn-apply-filters">Apply Filters</button>' +
							'<button type="button" class="btn btn-outline-secondary btn-sm" id="btn-clear-filters">Clear Filters</button>' +
						'</div>' +
					'</div>' +
					'<div class="br-table-wrap">' +
						'<table class="br-table">' +
							'<thead><tr>' +
								'<th class="br-table__sortable" data-sort="referenceNo">Reference No.' + renderSortIndicator('referenceNo', state.listSortKey, state.listSortDir) + '</th>' +
								'<th class="br-table__sortable" data-sort="fiscalYear">Fiscal Year' + renderSortIndicator('fiscalYear', state.listSortKey, state.listSortDir) + '</th>' +
								'<th class="br-table__sortable" data-sort="projectCount">Projects' + renderSortIndicator('projectCount', state.listSortKey, state.listSortDir) + '</th>' +
								'<th class="br-table__sortable text-end" data-sort="grandTotal">Grand Total' + renderSortIndicator('grandTotal', state.listSortKey, state.listSortDir) + '</th>' +
								'<th class="br-table__sortable" data-sort="currentStage">Current Stage' + renderSortIndicator('currentStage', state.listSortKey, state.listSortDir) + '</th>' +
								'<th class="br-table__sortable" data-sort="status">Status' + renderSortIndicator('status', state.listSortKey, state.listSortDir) + '</th>' +
								'<th class="br-table__sortable" data-sort="lastUpdated">Last Update' + renderSortIndicator('lastUpdated', state.listSortKey, state.listSortDir) + '</th>' +
								'<th>Action</th>' +
							'</tr></thead>' +
							'<tbody>' + strRows + '</tbody>' +
						'</table>' +
					'</div>' +
					'<div class="list-pagination">' +
						'<span>Showing ' + intFrom + '–' + intTo + ' of ' + objPage.total + '</span>' +
						'<div class="btn-group btn-group-sm">' +
							'<button type="button" class="btn btn-outline-secondary" id="btn-list-prev-page"' + (state.listCurrentPage <= 1 ? ' disabled' : '') + '>Previous</button>' +
							'<button type="button" class="btn btn-outline-secondary" disabled>Page ' + state.listCurrentPage + ' / ' + intLastPage + '</button>' +
							'<button type="button" class="btn btn-outline-secondary" id="btn-list-next-page"' + (state.listCurrentPage >= intLastPage ? ' disabled' : '') + '>Next</button>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>';
	}

	function bindListEvents()
	{
		var elSearch = document.getElementById('filter-search');
		if (elSearch)
		{
			elSearch.oninput = function(evt)
			{
				state.listFilters.search = evt.target.value;
			};
			elSearch.onkeydown = function(evt)
			{
				if (evt.key === 'Enter') applyListFilters();
			};
		}

		var elYear = document.getElementById('filter-year');
		if (elYear)
		{
			elYear.onchange = function(evt)
			{
				state.listFilters.fiscalYear = evt.target.value;
			};
		}

		var elStatus = document.getElementById('filter-status');
		if (elStatus)
		{
			elStatus.onchange = function(evt)
			{
				state.listFilters.status = evt.target.value;
			};
		}

		var elStage = document.getElementById('filter-stage');
		if (elStage)
		{
			elStage.onchange = function(evt)
			{
				state.listFilters.stage = evt.target.value;
			};
		}

		var elApply = document.getElementById('btn-apply-filters');
		if (elApply) elApply.onclick = applyListFilters;

		var elClear = document.getElementById('btn-clear-filters');
		if (elClear) elClear.onclick = clearListFilters;

		var elNewRequest = document.getElementById('btn-new-request');
		if (elNewRequest)
		{
			elNewRequest.onclick = function()
			{
				openDetailView(null);
			};
		}

		document.querySelectorAll('[data-sort]').forEach(function(elTh)
		{
			elTh.onclick = function()
			{
				var strKey = elTh.getAttribute('data-sort');
				if (state.listSortKey === strKey)
				{
					state.listSortDir = state.listSortDir === 'asc' ? 'desc' : 'asc';
				}
				else
				{
					state.listSortKey = strKey;
					state.listSortDir = 'asc';
				}
				state.listCurrentPage = 1;
				renderPage();
			};
		});

		var elPrev = document.getElementById('btn-list-prev-page');
		if (elPrev) elPrev.onclick = function() { state.listCurrentPage -= 1; renderPage(); };

		var elNext = document.getElementById('btn-list-next-page');
		if (elNext) elNext.onclick = function() { state.listCurrentPage += 1; renderPage(); };

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
			elBtn.onclick = function(evt)
			{
				evt.stopPropagation();
				var strAction = elBtn.getAttribute('data-action');
				var strId = elBtn.getAttribute('data-id');
				state.openActionMenuId = null;
				openDetailView(strId, strAction === 'edit');
			};
		});

		document.addEventListener('click', function closeMenus()
		{
			if (state.openActionMenuId)
			{
				state.openActionMenuId = null;
				renderPage();
			}
		}, { once: true });
	}

	/* -- Review Workflow ------------------------------ */
	function buildWorkflowSteps()
	{
		var strStatus = String(sampleBudgetRequest.status || 'draft').toLowerCase();
		var strStage = sampleBudgetRequest.currentStage || 'Agency Name';
		var strWorkflowStage = sampleBudgetRequest.workflowStage || 'pdo';
		var arrSteps = [
			{ title: 'Agency Name', actorRole: 'Agency Name' },
			{ title: 'PDO Review', actorRole: 'Planning and Development Office' },
			{ title: 'FO Review', actorRole: 'Finance Office' },
			{ title: 'Ready for Consolidation', actorRole: 'Budget Consolidation' }
		];

		function markStep(intIdx, strStatus, strStatusText, strActionAt)
		{
			return {
				title: arrSteps[intIdx].title,
				status: strStatus,
				statusText: strStatusText || '',
				actionAt: strActionAt || '',
				actorRole: arrSteps[intIdx].actorRole
			};
		}

		var arrResult = arrSteps.map(function(objStep, intIdx)
		{
			return markStep(intIdx, 'locked', '', '');
		});

		if (strStatus === 'draft')
		{
			arrResult[0] = markStep(0, 'current', 'Draft in progress', '');
			return arrResult;
		}

		if (strStatus.indexOf('returned') >= 0)
		{
			arrResult[0] = markStep(0, 'current', (isClarificationOnlyEdit() ? 'Returned for clarification' : 'Returned for revision') + ' - edit and resubmit', '');
			if (strStage.indexOf('PDO') >= 0) arrResult[1] = markStep(1, 'current', 'Returned at PDO Review', '');
			else if (strStage.indexOf('Finance') >= 0) {
				arrResult[1] = markStep(1, 'done', 'Validated', '');
				arrResult[2] = markStep(2, 'current', 'Returned at FO Review', '');
			}
			return arrResult;
		}

		if (strStatus === 'reviewed' || strWorkflowStage === 'ready' || strStage.indexOf('Ready for Consolidation') >= 0)
		{
			arrResult[0] = markStep(0, 'done', 'Submitted by ' + (sampleBudgetRequest.submittedBy || 'Requester'), sampleBudgetRequest.submittedAt || '');
			arrResult[1] = markStep(1, 'done', 'Validated', '');
			arrResult[2] = markStep(2, 'done', 'Validated', '');
			arrResult[3] = markStep(3, 'current', 'Reviewed', '');
			return arrResult;
		}

		if (strStatus === 'pending' || strStatus === 'submitted')
		{
			arrResult[0] = markStep(0, 'done', 'Submitted by ' + (sampleBudgetRequest.submittedBy || 'Maria Santos'), sampleBudgetRequest.submittedAt || '');
			if (strWorkflowStage === 'fo' || strStage.indexOf('Finance') >= 0)
			{
				arrResult[1] = markStep(1, 'done', 'Validated', '');
				arrResult[2] = markStep(2, 'current', 'Pending', sampleBudgetRequest.submittedAt || '');
			}
			else
			{
				arrResult[1] = markStep(1, 'current', 'Pending', sampleBudgetRequest.submittedAt || '');
			}
		}

		return arrResult;
	}

	function renderWorkflowNodeIcon(strStatus)
	{
		if (strStatus === 'done') return '✓';
		if (strStatus === 'current') return '◷';
		return '🔒';
	}

	function renderReviewWorkflowPanel()
	{
		var arrSteps = buildWorkflowSteps();
		var strHtml = '<div class="br-card"><p class="fw-bold text-uppercase section-eyebrow mb-3">Review Workflow</p>';

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
			strHtml += '</div>';
			strHtml += '<div class="mb-3">';
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

	/* -- Shell renderers ------------------------------ */
	function renderDetailHeader()
	{
		var strStatus = sampleBudgetRequest.status;
		elDetailHeader.innerHTML =
			'<div class="br-detail-header__inner">' +
				'<div class="d-flex justify-content-between align-items-start flex-wrap gap-2">' +
					'<div>' +
						'<h4 class="mb-1 fw-semibold">' + escapeHtml(state.form.title || 'Untitled Budget Request') + '</h4>' +
						'<p class="text-muted small mb-0">Ref: ' + escapeHtml(sampleBudgetRequest.referenceCode) + '</p>' +
					'</div>' +
					'<span class="status-badge ' + getStatusBadgeClass(strStatus) + '">' + escapeHtml(strStatus) + '</span>' +
				'</div>' +
			'</div>';
	}

	function renderWizardStepper()
	{
		var blnTabMode = isBudgetRequestTabMode();
		var arrSteps = getBudgetRequestStepDefinitions();

		elWizardStepper.className = blnTabMode ? 'br-wizard-stepper br-wizard-stepper--tabs' : 'br-wizard-stepper';
		elWizardStepper.setAttribute('aria-label', blnTabMode ? 'Budget request detail tabs' : 'Main wizard steps');

		if (blnTabMode)
		{
			var strTabHtml = '<div class="br-detail-tabs" role="tablist">';
			arrSteps.forEach(function(objStep)
			{
				if (objStep.hidden) return;
				var strClasses = 'br-detail-tabs__btn';
				if (objStep.id === state.wizardStep) strClasses += ' br-detail-tabs__btn--active';
				strTabHtml += '<button type="button" class="' + strClasses + '" data-wizard-step="' + objStep.id + '" role="tab">' +
					escapeHtml(objStep.tabLabel) + '</button>';
			});
			strTabHtml += '</div>';
			elWizardStepper.innerHTML = strTabHtml;
			return;
		}

		var strHtml = '<ul class="br-wizard-stepper__list">';
		arrSteps.forEach(function(objStep)
		{
			if (objStep.hidden) return;
			var strClasses = 'br-wizard-stepper__btn';
			if (objStep.id === state.wizardStep) strClasses += ' br-wizard-stepper__btn--active';
			strHtml += '<li><button type="button" class="' + strClasses + '" data-wizard-step="' + objStep.id + '">' + escapeHtml(objStep.wizardLabel) + '</button></li>';
		});
		strHtml += '</ul>';
		elWizardStepper.innerHTML = strHtml;
	}

	function renderFooterActionsTabMode()
	{
		var strHtml = '';
		var blnCanEditCore = canEditGeneralAndProjects();
		var blnCanEditAttachments = canEditAttachmentsJustification();
		var blnCanSubmit = isRequestEditable();
		var blnCanSave = blnCanEditCore || blnCanEditAttachments;

		if (canCancelRequest())
		{
			strHtml += '<button type="button" class="btn btn-outline-danger" id="btn-cancel-request">Cancel Request</button>';
		}

		if (blnCanSave &&
			(state.wizardStep === WIZARD_STEP_GENERAL ||
			state.wizardStep === WIZARD_STEP_PROJECTS ||
			state.wizardStep === WIZARD_STEP_ATTACHMENTS ||
			state.wizardStep === WIZARD_STEP_REVIEW))
		{
			strHtml += PrototypeUi.renderOutlineSecondaryButton('Save Request', { id: 'btn-save-draft' });
		}

		if (state.wizardStep === WIZARD_STEP_REVIEW && blnCanSubmit)
		{
			var strSubmitLabel = isRequestReturned() ? 'Resubmit Request' : 'Submit Request';
			strHtml += PrototypeUi.renderPrimaryButton(strSubmitLabel, { id: 'btn-submit-request' });
		}

		if (state.wizardStep === WIZARD_STEP_HISTORY && blnCanSubmit)
		{
			strHtml += PrototypeUi.renderPrimaryButton('Update Response', { 'data-wizard-step': WIZARD_STEP_ATTACHMENTS });
		}

		elDetailFooter.innerHTML = strHtml;
	}

	function renderFooterActions()
	{
		if (isBudgetRequestTabMode())
		{
			renderFooterActionsTabMode();
			return;
		}

		var strHtml = '';
		var blnCanEditCore = canEditGeneralAndProjects();
		var blnCanEditAttachments = canEditAttachmentsJustification();
		var blnCanSubmit = isRequestEditable();

		if (canCancelRequest())
		{
			strHtml += '<button type="button" class="btn btn-outline-danger" id="btn-cancel-request">Cancel Request</button>';
		}

		if (state.wizardStep === WIZARD_STEP_GENERAL)
		{
			if (blnCanEditCore) strHtml += PrototypeUi.renderOutlineSecondaryButton('Save Request', { id: 'btn-save-draft' });
			strHtml += PrototypeUi.renderPrimaryButton((isRequestLocked() ? 'View' : 'Next') + ': Projects & Budget', { id: 'btn-next-step' });
		}
		else if (state.wizardStep === WIZARD_STEP_PROJECTS)
		{
			strHtml += '<button type="button" class="btn btn-outline-secondary" data-wizard-step="' + WIZARD_STEP_GENERAL + '">Back</button>';
			if (blnCanEditCore) strHtml += PrototypeUi.renderOutlineSecondaryButton('Save Request', { id: 'btn-save-draft' });
			strHtml += PrototypeUi.renderPrimaryButton((isRequestLocked() ? 'View' : 'Next') + ': Attachments & Justification', { 'data-wizard-step': WIZARD_STEP_ATTACHMENTS });
		}
		else if (state.wizardStep === WIZARD_STEP_ATTACHMENTS)
		{
			strHtml += '<button type="button" class="btn btn-outline-secondary" data-wizard-step="' + WIZARD_STEP_PROJECTS + '">Back</button>';
			if (blnCanEditAttachments) strHtml += PrototypeUi.renderOutlineSecondaryButton('Save Request', { id: 'btn-save-draft' });
			strHtml += PrototypeUi.renderPrimaryButton((isRequestLocked() ? 'View' : 'Next') + ': Review & Submit', { 'data-wizard-step': WIZARD_STEP_REVIEW });
		}
		else if (state.wizardStep === WIZARD_STEP_REVIEW)
		{
			strHtml += '<button type="button" class="btn btn-outline-secondary" data-wizard-step="' + WIZARD_STEP_ATTACHMENTS + '">Back</button>';
			if (blnCanSubmit)
			{
				if (blnCanEditCore || blnCanEditAttachments) strHtml += PrototypeUi.renderOutlineSecondaryButton('Save Request', { id: 'btn-save-draft' });
				var strSubmitLabel = isRequestReturned() ? 'Resubmit Request' : 'Submit Request';
				strHtml += PrototypeUi.renderPrimaryButton(strSubmitLabel, { id: 'btn-submit-request' });
			}
		}
		else if (state.wizardStep === WIZARD_STEP_HISTORY)
		{
			strHtml += '<button type="button" class="btn btn-outline-secondary" data-wizard-step="' + WIZARD_STEP_REVIEW + '">Back to Review</button>';
			if (isVersioningVisible())
			{
				strHtml += '<button type="button" class="btn btn-outline-primary" data-wizard-step="' + WIZARD_STEP_VERSIONING + '">Versioning</button>';
			}
			if (blnCanSubmit)
			{
				strHtml += PrototypeUi.renderPrimaryButton('Update Response', { 'data-wizard-step': WIZARD_STEP_ATTACHMENTS });
			}
		}
		else if (state.wizardStep === WIZARD_STEP_VERSIONING)
		{
			strHtml += '<button type="button" class="btn btn-outline-secondary" data-wizard-step="' + (isReviewHistoryVisible() ? WIZARD_STEP_HISTORY : WIZARD_STEP_REVIEW) + '">Back</button>';
		}

		elDetailFooter.innerHTML = strHtml;
	}

	/* -- Step 1: General Information ------------------ */
	function renderStepGeneralInformation()
	{
		var strRo = getReadOnlyAttr();
		var strDis = getDisabledAttr();

		return '<div class="br-card">' +
			'<div class="d-flex justify-content-between align-items-center mb-3">' +
				'<span class="fw-bold text-uppercase section-eyebrow">General Information</span>' +
			'</div>' +
			'<div class="mb-3">' +
				'<label class="form-label fw-semibold" for="br-title">Budget Request Title</label>' +
				'<input type="text" class="form-control" id="br-title" maxlength="255" placeholder="Short title that identifies this budget request" value="' + escapeHtml(state.form.title) + '"' + strRo + '>' +
			'</div>' +
			'<div class="row g-3 mb-3">' +
				'<div class="col-md-6">' +
					'<label class="form-label fw-semibold" for="br-fiscal-year">Fiscal Year</label>' +
					'<select class="form-select" id="br-fiscal-year"' + strDis + '>' +
						'<option value="2026"' + (state.form.fiscalYear === '2026' ? ' selected' : '') + '>2026</option>' +
						'<option value="2027"' + (state.form.fiscalYear === '2027' ? ' selected' : '') + '>2027</option>' +
						'<option value="2028"' + (state.form.fiscalYear === '2028' ? ' selected' : '') + '>2028</option>' +
					'</select>' +
				'</div>' +
			'</div>' +
			'<div class="mb-3">' +
				'<label class="form-label fw-semibold">Agency Name</label>' +
				'<input type="text" class="form-control" readonly value="' + escapeHtml(sampleBudgetRequest.requestingUnit) + '">' +
			'</div>' +
			'<div class="mb-3">' +
				'<label class="form-label fw-semibold">Agency Category</label>' +
				'<input type="text" class="form-control" readonly value="' + escapeHtml(sampleBudgetRequest.agencyCategory) + '">' +
			'</div>' +
			'<div class="mb-0">' +
				'<label class="form-label fw-semibold" for="br-description">Description</label>' +
				'<textarea class="form-control" id="br-description" rows="4" maxlength="2000" placeholder="Purpose and scope of this budget request"' + strRo + '>' + escapeHtml(state.form.description) + '</textarea>' +
			'</div>' +
		'</div>';
	}

	/* -- Step 2: Projects & Budget -------------------- */
	function renderProjectNavigator()
	{
		var blnEditable = canEditGeneralAndProjects();
		var strHtml = '<div class="br-card project-navigator">' +
			'<div class="d-flex justify-content-between align-items-center mb-3">' +
				'<span class="fw-bold text-uppercase section-eyebrow">Project Navigator</span>' +
			'</div>';

		projects.forEach(function(objProject)
		{
			var objTotals = computeProjectTotals(objProject);
			var intMeasureCount = countPhysicalMeasures(objProject);
			var strSelected = objProject.id === state.selectedProjectId ? ' project-nav-card--selected' : '';
			var strCompletion = getProjectCompletionStatus(objProject);

			strHtml += '<div class="project-nav-card' + strSelected + '" data-project-id="' + escapeHtml(objProject.id) + '">' +
				'<div class="project-nav-card__header">' +
					'<div class="fw-semibold small">' + escapeHtml(getProjectDisplayName(objProject)) + '</div>' +
					(blnEditable ? PrototypeUi.renderTrashButton('Delete project', { 'data-delete-project': objProject.id }) : '') +
				'</div>' +
				'<div class="mt-2 d-flex flex-wrap gap-1">' +
					'<span class="status-badge status-badge--' + strCompletion + '">' + strCompletion + '</span>' +
				'</div>' +
				'<div class="text-muted small mt-2">Measures: ' + intMeasureCount + '</div>' +
				'<div class="fw-semibold small mt-1">' + formatCurrency(objTotals.grand) + '</div>' +
			'</div>';
		});

		if (blnEditable)
		{
			strHtml += '<div class="project-navigator__add">' +
				PrototypeUi.renderAddButton('Add Project', { id: 'btn-add-project', className: 'w-100' }) +
			'</div>';
		}

		strHtml += '</div>';
		return strHtml;
	}

	function renderProjectMiniStepper()
	{
		var arrSteps = [
			{ id: PROJECT_STEP_INFO, label: 'Project Info' },
			{ id: PROJECT_STEP_MEASURES, label: 'Physical Measures' },
			{ id: PROJECT_STEP_BUDGET, label: 'Line Item Budget' }
		];

		var strHtml = '<div class="project-mini-stepper">';
		arrSteps.forEach(function(objStep)
		{
			var strActive = objStep.id === state.projectMiniStep ? ' project-mini-stepper__btn--active' : '';
			strHtml += '<button type="button" class="project-mini-stepper__btn' + strActive + '" data-project-step="' + objStep.id + '">' + escapeHtml(objStep.label) + '</button>';
		});
		strHtml += '</div>';
		return strHtml;
	}

	function renderProjectInfo(objProject)
	{
		var strRo = getReadOnlyAttr();
		var strDis = getDisabledAttr();

		return '<div class="mb-3">' +
				'<label class="form-label fw-semibold">Project Name</label>' +
				'<input type="text" class="form-control" data-project-field="name" placeholder="Official name of the project" value="' + escapeHtml(objProject.name) + '"' + strRo + '>' +
			'</div>' +
			'<div class="mb-3">' +
				'<label class="form-label fw-semibold">Program Name</label>' +
				'<input type="text" class="form-control" data-project-field="programName" placeholder="Program this project belongs to" value="' + escapeHtml(objProject.programName) + '"' + strRo + '>' +
			'</div>' +
			'<div class="mb-3">' +
				'<label class="form-label fw-semibold">Pillar Category</label>' +
				'<select class="form-select" data-project-field="pillarCategory"' + strDis + '>' +
				'<option value="">Select pillar category</option>' +
				PILLAR_CATEGORY_OPTIONS.map(function(strOption) {
					var strSelected = objProject.pillarCategory === strOption ? ' selected' : '';
					return '<option value="' + escapeHtml(strOption) + '"' + strSelected + '>' + escapeHtml(strOption) + '</option>';
				}).join('') +
				'</select>' +
			'</div>' +
			'<div class="mb-0">' +
				'<label class="form-label fw-semibold">Project Description</label>' +
				'<textarea class="form-control" rows="3" data-project-field="description" placeholder="Objectives and expected outputs of the project"' + strRo + '>' + escapeHtml(objProject.description) + '</textarea>' +
			'</div>';
	}

	function renderPhysicalMeasures(objProject)
	{
		var strHtml = '';
		var blnEditable = canEditGeneralAndProjects();
		var strRo = getReadOnlyAttr();
		var strDis = getDisabledAttr();

		(objProject.physicalMeasures || []).forEach(function(objMeasureState)
		{
			var objCatalog = getMeasureCatalogEntry(objMeasureState.measureId);
			if (!objCatalog) return;

			var strExpandedClass = objMeasureState.expanded ? ' metric-accordion--expanded' : '';
			var intParticularCount = (objMeasureState.entries || []).length;
			var strParticularWord = intParticularCount === 1 ? 'particular' : 'particulars';

			strHtml += '<div class="metric-accordion' + strExpandedClass + '">';
			strHtml += '<div class="metric-accordion__header">';
			strHtml += '<button type="button" class="metric-accordion__toggle" data-toggle-measure="' + escapeHtml(objMeasureState.measureId) + '">' +
				escapeHtml(objCatalog.title) + ' - ' + intParticularCount + ' ' + strParticularWord + (objMeasureState.expanded ? ' ▾' : ' ▸') +
			'</button>';
			if (blnEditable)
			{
				strHtml += PrototypeUi.renderAddButton('Add Particular', { className: 'metric-accordion__add-btn', 'data-add-entry': objMeasureState.measureId });
			}
			strHtml += '</div>';

			if (objMeasureState.expanded)
			{
			strHtml += '<div class="metric-accordion__body">';

			if ((objMeasureState.entries || []).length === 0)
			{
				strHtml += '<p class="metric-accordion__empty mb-0">No particulars added yet. Click Add Particular.</p>';
			}

			(objMeasureState.entries || []).forEach(function(objEntry)
			{
				var strHint = getParticularSpecHint(objMeasureState.measureId, objEntry.particularValue);
				var blnIsOthers = objEntry.particularValue === 'others';
				var strMeasureId = escapeHtml(objMeasureState.measureId);
				var strEntryId = escapeHtml(objEntry.id);

				strHtml += '<div class="particular-detail-card">';
				if (blnEditable)
				{
					strHtml += '<div class="particular-detail-card__toolbar">' +
						'<span class="particular-detail-card__label">Particular entry</span>' +
						PrototypeUi.renderTrashButton('Remove particular', {
							'data-remove-entry': '',
							'data-measure-id': objMeasureState.measureId,
							'data-entry-id': objEntry.id
						}) +
					'</div>';
				}
				strHtml += '<div class="row g-2">';
				strHtml += '<div class="col-md-6">';
				strHtml += '<label class="form-label small">Particular</label>';
				strHtml += '<select class="form-select form-select-sm" data-entry-particular data-measure-id="' + strMeasureId + '" data-entry-id="' + strEntryId + '"' + strDis + '>';
				strHtml += '<option value="">Select particular</option>';

				(objCatalog.particulars || []).forEach(function(objPart)
				{
					var strSelected = objEntry.particularValue === objPart.value ? ' selected' : '';
					strHtml += '<option value="' + escapeHtml(objPart.value) + '"' + strSelected + '>' + escapeHtml(objPart.label) + '</option>';
				});

				strHtml += '</select></div>';
				strHtml += '<div class="col-md-6">';
				strHtml += '<label class="form-label small">Quantity</label>';
				strHtml += '<input type="number" class="form-control form-control-sm" min="0" placeholder="Target quantity for the fiscal year" data-entry-qty data-measure-id="' + strMeasureId + '" data-entry-id="' + strEntryId + '" value="' + escapeHtml(objEntry.quantity) + '"' + strRo + '>';
				strHtml += '</div>';
				strHtml += '</div>';

				if (strHint)
				{
					strHtml += '<p class="text-muted small mb-1 mt-2">Specify: ' + escapeHtml(strHint) + '</p>';
				}

				strHtml += '<label class="form-label small">Specification</label>';
				strHtml += '<textarea class="form-control form-control-sm" rows="2" placeholder="Details of this particular (title, venue, coverage, etc.)" data-entry-spec data-measure-id="' + strMeasureId + '" data-entry-id="' + strEntryId + '"' + strRo + '>' + escapeHtml(objEntry.specification) + '</textarea>';

				if (blnIsOthers)
				{
					strHtml += '<label class="form-label small mt-2">Others (specify)</label>';
					strHtml += '<input type="text" class="form-control form-control-sm" placeholder="Name the particular not covered by the list" data-entry-others data-measure-id="' + strMeasureId + '" data-entry-id="' + strEntryId + '" value="' + escapeHtml(objEntry.othersText) + '"' + strRo + '>';
				}

				strHtml += '</div>';
			});

			strHtml += '</div>';
			}

			strHtml += '</div>';
		});

		return strHtml;
	}

	function renderLineItemGroup(strCategory, arrItems)
	{
		var dblSubtotal = 0;
		var strLower = strCategory.toLowerCase();
		var blnEditable = canEditGeneralAndProjects();
		var strHtml = '<div class="allotment-group allotment-group--' + strLower + '">' +
			'<div class="allotment-group__header">' + strCategory + '</div>';

		arrItems.forEach(function(objItem)
		{
			dblSubtotal += Number(objItem.amount) || 0;
			strHtml += '<div class="line-item-row">' +
				'<span class="line-item-row__desc">' + escapeHtml(getLineItemDisplayLabel(objItem)) + '</span>' +
				'<div class="line-item-row__meta">' +
					'<span class="line-item-row__amount">' + formatCurrency(objItem.amount) + '</span>';
			if (blnEditable)
			{
				strHtml += '<div class="line-item-row__actions">' +
						PrototypeUi.renderEditButton('Edit expense item', { 'data-edit-expense': objItem.id }) +
						PrototypeUi.renderTrashButton('Delete expense item', { 'data-delete-expense': objItem.id }) +
					'</div>';
			}
			strHtml += '</div></div>';
		});

		strHtml += '<div class="d-flex justify-content-between fw-semibold pt-2">' +
			'<span>Subtotal</span><span>' + formatCurrency(dblSubtotal) + '</span></div></div>';
		return strHtml;
	}

	function renderLineItemBudget(objProject)
	{
		var objTotals = computeProjectTotals(objProject);
		var objByCategory = { PS: [], MOOE: [], CO: [] };

		(objProject.lineItems || []).forEach(function(objItem)
		{
			var strCat = String(objItem.category || '').toUpperCase();
			if (objByCategory[strCat]) objByCategory[strCat].push(objItem);
		});

		var strHtml = '<div class="totals-grid">' +
			'<div class="totals-card totals-card--ps"><div class="totals-card__label">PS Total</div><div class="totals-card__value">' + formatCurrency(objTotals.PS) + '</div></div>' +
			'<div class="totals-card totals-card--mooe"><div class="totals-card__label">MOOE Total</div><div class="totals-card__value">' + formatCurrency(objTotals.MOOE) + '</div></div>' +
			'<div class="totals-card totals-card--co"><div class="totals-card__label">CO Total</div><div class="totals-card__value">' + formatCurrency(objTotals.CO) + '</div></div>' +
			'<div class="totals-card"><div class="totals-card__label">Project Total</div><div class="totals-card__value">' + formatCurrency(objTotals.grand) + '</div></div>' +
		'</div>' +
		(canEditGeneralAndProjects() ? '<div class="line-budget-toolbar">' +
			PrototypeUi.renderAddButton('Add Expense Item', { id: 'btn-add-expense' }) +
		'</div>' : '');

		ALLOTMENT_CASES.forEach(function(strCat)
		{
			strHtml += renderLineItemGroup(strCat, objByCategory[strCat]);
		});

		return strHtml;
	}

	function renderProjectWorkspace()
	{
		var objProject = getSelectedProject();
		var strBody = '';

		if (state.projectMiniStep === PROJECT_STEP_INFO)
		{
			strBody = renderProjectInfo(objProject);
		}
		else if (state.projectMiniStep === PROJECT_STEP_MEASURES)
		{
			strBody = renderPhysicalMeasures(objProject);
		}
		else
		{
			strBody = renderLineItemBudget(objProject);
		}

		var strSummaryToggle = '';
		if (!state.summaryPanelVisible)
		{
			strSummaryToggle = PrototypeUi.renderSecondaryButton('Show Budget Summary', { id: 'btn-show-summary', className: 'summary-toggle-btn' });
		}

		return '<div class="br-card project-workspace">' +
			'<div class="d-flex justify-content-between align-items-center mb-3">' +
				'<span class="fw-bold text-uppercase section-eyebrow">Selected Project Workspace</span>' +
				strSummaryToggle +
			'</div>' +
			renderProjectMiniStepper() +
			strBody +
		'</div>';
	}

	function renderBudgetRequestSummary()
	{
		var objTotals = computeRequestTotals();
		var strHiddenClass = state.summaryPanelVisible ? '' : ' br-context-panel--summary-hidden';

		var strHtml = '<div class="budget-summary-panel' + strHiddenClass + '" id="budget-summary-panel">' +
			'<div class="br-card">' +
				'<div class="d-flex justify-content-between align-items-center mb-3">' +
					'<span class="fw-bold text-uppercase section-eyebrow">Budget Request Summary</span>' +
					PrototypeUi.renderSecondaryButton(state.summaryPanelVisible ? 'Hide' : 'Show', { id: 'btn-toggle-summary', className: 'summary-toggle-btn' }) +
				'</div>';

		projects.forEach(function(objProject)
		{
			var objProjectTotals = computeProjectTotals(objProject);
			strHtml += '<div class="d-flex justify-content-between small mb-2">' +
				'<span class="text-truncate me-2">' + escapeHtml(getProjectDisplayName(objProject)) + '</span>' +
				'<span class="fw-semibold">' + formatCurrency(objProjectTotals.grand) + '</span>' +
			'</div>';
		});

		strHtml += '<hr>' +
			'<div class="d-flex justify-content-between small mb-1"><span>PS</span><span>' + formatCurrency(objTotals.PS) + '</span></div>' +
			'<div class="d-flex justify-content-between small mb-1"><span>MOOE</span><span>' + formatCurrency(objTotals.MOOE) + '</span></div>' +
			'<div class="d-flex justify-content-between small mb-2"><span>CO</span><span>' + formatCurrency(objTotals.CO) + '</span></div>' +
			'<div class="d-flex justify-content-between fw-bold"><span>Grand Total</span><span>' + formatCurrency(objTotals.grand) + '</span></div>' +
		'</div>' +
		renderCompletionChecklistCard() +
		'</div>';

		return strHtml;
	}

	function renderStepProjectsBudget()
	{
		return '<div class="br-step-projects">' +
			'<div class="br-wizard-content__main">' +
				renderProjectNavigator() +
				renderProjectWorkspace() +
				renderBudgetRequestSummary() +
			'</div>' +
		'</div>';
	}

	//this function creates a blank project shell for the wizard
	function createBlankProject()
	{
		return {
			id: 'proj-' + Date.now(),
			name: '',
			programName: '',
			pillarCategory: '',
			description: '',
			physicalMeasures: createEmptyPhysicalMeasures(),
			lineItems: []
		};
	}

	//this function returns a readable project name for lists and summaries
	function getProjectDisplayName(objProject)
	{
		return String((objProject && objProject.name) || '').trim() || 'Untitled Project';
	}

	function createEmptyPhysicalMeasures()
		{
			return PHYSICAL_MEASURES_CATALOG.map(function(objMeasure)
			{
				return {
					measureId: objMeasure.id,
					expanded: false,
					entries: []
				};
			});
		}

	function getMeasureCatalogEntry(strMeasureId)
	{
		return PHYSICAL_MEASURES_CATALOG.find(function(objMeasure)
		{
			return objMeasure.id === strMeasureId;
		}) || null;
	}

	function getParticularCatalogEntry(strMeasureId, strParticularValue)
	{
		var objMeasure = getMeasureCatalogEntry(strMeasureId);
		if (!objMeasure) return null;
		return (objMeasure.particulars || []).find(function(objPart)
		{
			return objPart.value === strParticularValue;
		}) || null;
	}

	function getParticularSpecHint(strMeasureId, strParticularValue)
	{
		var objPart = getParticularCatalogEntry(strMeasureId, strParticularValue);
		return objPart ? objPart.specificationHint : '';
	}

	function getParticularLabel(strMeasureId, strParticularValue)
	{
		var objPart = getParticularCatalogEntry(strMeasureId, strParticularValue);
		return objPart ? objPart.label : strParticularValue;
	}

	function findPhysicalMeasureEntry(objProject, strMeasureId, strEntryId)
	{
		var objMeasure = (objProject.physicalMeasures || []).find(function(m)
		{
			return m.measureId === strMeasureId;
		});
		if (!objMeasure) return { measure: null, entry: null };

		var objEntry = (objMeasure.entries || []).find(function(e)
		{
			return e.id === strEntryId;
		});
		return { measure: objMeasure, entry: objEntry };
	}

	/* -- Step 3: Attachments & Justification --------------- */
	function renderAttachedFilesSection()
	{
		var blnEditable = canEditAttachmentsJustification();
		var strHtml = '<div class="br-card mb-4">' +
			'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">Attached Files</span>';

		if (blnEditable)
		{
			strHtml += '<div class="d-flex align-items-center gap-2 mb-3">' +
				PrototypeUi.renderAddButton('Add File', { id: 'btn-add-attachment-file' }) +
				'<span class="text-muted small">Choose supporting documents from your device.</span>' +
				'<input type="file" class="visually-hidden" id="br-attachment-file-input" multiple>' +
			'</div>';
		}

		if (state.attachedFiles.length === 0)
		{
			strHtml += '<p class="text-muted small mb-0">No files attached.</p>';
		}
		else
		{
			state.attachedFiles.forEach(function(objFile)
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

	function renderJustificationSection()
	{
		var blnEditable = canEditAttachmentsJustification();
		var strHtml = '<div class="br-card">' +
			'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">Justification</span>' +
			'<p class="text-muted small mb-3">Provide legal and practical considerations supporting this budget request.</p>';

		if (blnEditable)
		{
			var blnCanPost = String(state.justificationDraft || '').trim() !== '';
			strHtml += '<textarea class="form-control" id="br-justification" rows="5" maxlength="2000" placeholder="Why this budget is needed and how the amounts were estimated">' +
				escapeHtml(state.justificationDraft || '') + '</textarea>' +
				'<div class="d-flex justify-content-end mt-2 mb-4">' +
					'<button type="button" class="btn btn-sm btn-primary" id="btn-post-justification"' +
						(blnCanPost ? '' : ' disabled') + '>Post</button>' +
				'</div>';
		}

		if (state.justificationPosts.length > 0)
		{
			if (blnEditable)
			{
				strHtml += '<span class="fw-semibold small d-block mb-2">Posted Justifications</span>';
			}
			strHtml += renderJustificationPostsList(state.justificationPosts);
		}
		else if (!blnEditable)
		{
			strHtml += '<p class="text-muted small mb-0">No justification posted.</p>';
		}

		strHtml += '</div>';
		return strHtml;
	}

	function renderAttachedFilesReviewList()
	{
		if (!state.attachedFiles.length) return '<p class="mb-0">None</p>';
		return state.attachedFiles.map(function(objFile)
		{
			return '<div class="mb-2">' +
				'<div class="fw-semibold">' + escapeHtml(objFile.name) + '</div>' +
				'<div class="text-muted small">' + escapeHtml(formatFileSize(objFile.size)) +
					(objFile.type ? ' · ' + escapeHtml(objFile.type) : '') + '</div>' +
				renderActorMeta('Uploaded by', objFile.uploadedBy, objFile.uploadedAt) +
			'</div>';
		}).join('');
	}

	function renderStepAttachmentsJustification()
	{
		return renderAttachedFilesSection() +
			renderJustificationSection();
	}

	/* -- Step 4: Review & Submit ---------------------- */
	function renderStepReviewSubmit()
	{
		var objTotals = computeRequestTotals();

		var strProjectRows = projects.map(function(objProject)
		{
			var objProjectTotals = computeProjectTotals(objProject);
			return '<tr>' +
				'<td>' + escapeHtml(getProjectDisplayName(objProject)) + '</td>' +
				'<td class="text-end">' + formatCurrency(objProjectTotals.PS) + '</td>' +
				'<td class="text-end">' + formatCurrency(objProjectTotals.MOOE) + '</td>' +
				'<td class="text-end">' + formatCurrency(objProjectTotals.CO) + '</td>' +
				'<td class="text-end fw-semibold">' + formatCurrency(objProjectTotals.grand) + '</td>' +
			'</tr>';
		}).join('');

		return '<div class="br-card mb-4">' +
			'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">Budget Request Information</span>' +
			'<dl class="row mb-0 small">' +
				'<dt class="col-sm-3">Title</dt><dd class="col-sm-9">' + escapeHtml(state.form.title) + '</dd>' +
				'<dt class="col-sm-3">Fiscal Year</dt><dd class="col-sm-9">' + escapeHtml(state.form.fiscalYear) + '</dd>' +
				'<dt class="col-sm-3">Agency Name</dt><dd class="col-sm-9">' + escapeHtml(sampleBudgetRequest.requestingUnit) + '</dd>' +
				'<dt class="col-sm-3">Agency Category</dt><dd class="col-sm-9">' + escapeHtml(sampleBudgetRequest.agencyCategory) + '</dd>' +
				'<dt class="col-sm-3">Description</dt><dd class="col-sm-9">' + escapeHtml(state.form.description) + '</dd>' +
			'</dl>' +
		'</div>' +
		'<div class="br-card mb-4">' +
			'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">Attachments & Justification</span>' +
			'<div class="mb-3">' +
				'<div class="small fw-semibold mb-2">Attached Files</div>' +
				renderAttachedFilesReviewList() +
			'</div>' +
			'<div>' +
				'<div class="small fw-semibold mb-2">Justification</div>' +
				renderJustificationPostsList(state.justificationPosts) +
			'</div>' +
		'</div>' +
		'<div class="br-card">' +
			'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">Project Summary</span>' +
			'<div class="table-responsive">' +
				'<table class="table table-sm align-middle mb-4">' +
					'<thead><tr><th>Project</th><th class="text-end">PS</th><th class="text-end">MOOE</th><th class="text-end">CO</th><th class="text-end">Total</th></tr></thead>' +
					'<tbody>' + strProjectRows + '</tbody>' +
				'</table>' +
			'</div>' +
			'<div class="row justify-content-end"><div class="col-md-5">' +
				'<div class="d-flex justify-content-between small mb-1"><span>PS Total</span><span>' + formatCurrency(objTotals.PS) + '</span></div>' +
				'<div class="d-flex justify-content-between small mb-1"><span>MOOE Total</span><span>' + formatCurrency(objTotals.MOOE) + '</span></div>' +
				'<div class="d-flex justify-content-between small mb-2"><span>CO Total</span><span>' + formatCurrency(objTotals.CO) + '</span></div>' +
				'<div class="d-flex justify-content-between fw-bold border-top pt-2"><span>Grand Total</span><span>' + formatCurrency(objTotals.grand) + '</span></div>' +
			'</div></div>' +
		'</div>';
	}

	/* -- Step 4: Versioning -------------------------- */
	function getVersionProjectExpandKey(intVersionNumber, strProjectId)
	{
		return 'v' + intVersionNumber + '-' + strProjectId;
	}

	function isVersionProjectExpanded(intVersionNumber, strProjectId)
	{
		return state.versionProjectExpanded[getVersionProjectExpandKey(intVersionNumber, strProjectId)] === true;
	}

	function renderVersionProjectDetails(objProject)
	{
		var objTotals = computeProjectTotals(objProject);
		var strMeasures = (objProject.physicalMeasures || []).map(function(objMeasureState)
		{
			var objCatalog = getMeasureCatalogEntry(objMeasureState.measureId);
			var strTitle = objCatalog ? objCatalog.title : objMeasureState.measureId;
			var strParts = (objMeasureState.entries || []).filter(function(objEntry)
			{
				return objEntry.particularValue && Number(objEntry.quantity) > 0;
			}).map(function(objEntry)
			{
				var strLabel = getParticularLabel(objMeasureState.measureId, objEntry.particularValue);
				var strSpec = objEntry.specification;
				if (objEntry.particularValue === 'others' && objEntry.othersText)
				{
					strSpec = objEntry.othersText + (strSpec ? ' - ' + strSpec : '');
				}
				return '<li>' + escapeHtml(strLabel) + ': ' + escapeHtml(objEntry.quantity) + ' - ' + escapeHtml(strSpec) + '</li>';
			}).join('');

			if (!strParts) return '';

			return '<div class="small mb-2"><strong>' + escapeHtml(strTitle) + '</strong><ul class="mb-0">' + strParts + '</ul></div>';
		}).join('');

		var strLineItems = (objProject.lineItems || []).map(function(objItem)
		{
			return '<li>' + escapeHtml(objItem.category) + ': ' + escapeHtml(getLineItemDisplayLabel(objItem)) + ' - ' + formatCurrency(objItem.amount) + '</li>';
		}).join('');

		return '<div class="version-snapshot-section"><h6>Project Info</h6>' +
			'<p class="small mb-1"><strong>Program:</strong> ' + escapeHtml(objProject.programName) + '</p>' +
			'<p class="small mb-1"><strong>Pillar:</strong> ' + escapeHtml(objProject.pillarCategory) + '</p>' +
			'<p class="small mb-0">' + escapeHtml(objProject.description) + '</p>' +
		'</div>' +
		'<div class="version-snapshot-section"><h6>Physical Measures</h6>' + (strMeasures || '<p class="small text-muted mb-0">No physical measures recorded.</p>') + '</div>' +
		'<div class="version-snapshot-section"><h6>Line Budget Items</h6><ul class="small mb-2">' + strLineItems + '</ul>' +
			'<div class="small">PS: ' + formatCurrency(objTotals.PS) + ' · MOOE: ' + formatCurrency(objTotals.MOOE) + ' · CO: ' + formatCurrency(objTotals.CO) + ' · Project Total: ' + formatCurrency(objTotals.grand) + '</div>' +
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

	function renderVersionSnapshotBody(intVersionNumber, objSnapshot)
	{
		var strProjectBlocks = (objSnapshot.projects || []).map(function(objProject)
		{
			var objTotals = computeProjectTotals(objProject);
			var blnExpanded = isVersionProjectExpanded(intVersionNumber, objProject.id);
			var strExpandedClass = blnExpanded ? ' metric-accordion--expanded' : '';
			var strChevron = blnExpanded ? ' ▾' : ' ▸';
			var strProjectId = escapeHtml(objProject.id);

			var strHtml = '<div class="metric-accordion version-project-accordion' + strExpandedClass + '">';
			strHtml += '<div class="metric-accordion__header">';
			strHtml += '<button type="button" class="metric-accordion__toggle" data-toggle-version-project data-version-number="' + intVersionNumber + '" data-project-id="' + strProjectId + '">' +
				escapeHtml(getProjectDisplayName(objProject)) + strChevron +
			'</button>';
			strHtml += '<span class="version-project-accordion__total small">' + formatCurrency(objTotals.grand) + '</span>';
			strHtml += '</div>';

			if (blnExpanded)
			{
				strHtml += '<div class="metric-accordion__body">' + renderVersionProjectDetails(objProject) + '</div>';
			}

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

	function renderStepReviewHistory()
	{
		var arrHistory = getReviewHistory();
		var strRows = arrHistory.map(function(objRow)
		{
			return '<tr>' +
				'<td>' + escapeHtml(objRow.date) + '</td>' +
				'<td>' + escapeHtml(objRow.user) + '</td>' +
				'<td>' + escapeHtml(objRow.role) + '</td>' +
				'<td>' + escapeHtml(objRow.action) + '</td>' +
				'<td>' + escapeHtml(objRow.reason || '-') + '</td>' +
				'<td>' + escapeHtml(objRow.remark) + '</td>' +
			'</tr>';
		}).join('');

		var strResponseBlock = '';
		if (canEditAttachmentsJustification() || state.justificationPosts.length > 0)
		{
			strResponseBlock = '<div class="mt-4">' +
				(canEditAttachmentsJustification()
					? renderJustificationSection()
					: '<div class="br-card"><span class="fw-bold text-uppercase section-eyebrow d-block mb-3">Justification</span>' +
						renderJustificationPostsList(state.justificationPosts) + '</div>') +
			'</div>';
		}

		return '<div class="br-card">' +
				'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">Review History</span>' +
				'<div class="table-responsive">' +
					'<table class="table table-sm align-middle mb-0">' +
						'<thead><tr><th>Date</th><th>User</th><th>Role</th><th>Action</th><th>Reason</th><th>Remark</th></tr></thead>' +
						'<tbody>' + (strRows || '<tr><td colspan="6" class="text-muted">No review history yet.</td></tr>') + '</tbody>' +
					'</table>' +
				'</div>' +
			'</div>' +
			strResponseBlock;
	}

	function renderStepVersioning()
	{
		if (sampleVersions.length === 0)
		{
			return '<div class="br-card"><p class="text-muted mb-0">No versions yet. Submit the request to create the first version snapshot.</p></div>';
		}

		var arrSorted = sampleVersions.slice().sort(function(a, b)
		{
			return b.versionNumber - a.versionNumber;
		});

		var intLatestVersion = arrSorted[0].versionNumber;

		return '<div class="br-card">' +
			'<span class="fw-bold text-uppercase section-eyebrow d-block mb-3">Version History</span>' +
			arrSorted.map(function(objVersion)
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
					strHtml += renderVersionSnapshotBody(objVersion.versionNumber, objVersion.snapshot);
					strHtml += '</div></div>';
				}

				strHtml += '</div>';
				return strHtml;
			}).join('') +
		'</div>';
	}

	/* -- Context panel routing ---------------------- */
	function renderContextPanel()
	{
		if (state.wizardStep === WIZARD_STEP_PROJECTS || state.wizardStep === WIZARD_STEP_VERSIONING || state.wizardStep === WIZARD_STEP_HISTORY)
		{
			elContextPanel.innerHTML = '';
			elContextPanel.style.display = 'none';
			return;
		}

		elContextPanel.style.display = '';
		var strPanelHtml = renderReviewWorkflowPanel();

		if (state.wizardStep === WIZARD_STEP_GENERAL || state.wizardStep === WIZARD_STEP_ATTACHMENTS || state.wizardStep === WIZARD_STEP_REVIEW)
		{
			strPanelHtml += renderCompletionChecklistCard();
		}

		elContextPanel.innerHTML = strPanelHtml;
	}

	/* -- Main render -------------------------------- */
	function renderWizardContent()
	{
		elDetailBody.classList.remove('br-detail-body--step2');

		if (state.wizardStep === WIZARD_STEP_GENERAL)
		{
			elWizardContent.innerHTML = wrapWizardStepWithBanner(renderStepGeneralInformation());
		}
		else if (state.wizardStep === WIZARD_STEP_PROJECTS)
		{
			elDetailBody.classList.add('br-detail-body--step2');
			elWizardContent.innerHTML = wrapWizardStepWithBanner(renderStepProjectsBudget());
		}
		else if (state.wizardStep === WIZARD_STEP_ATTACHMENTS)
		{
			elWizardContent.innerHTML = wrapWizardStepWithBanner(renderStepAttachmentsJustification());
		}
		else if (state.wizardStep === WIZARD_STEP_REVIEW)
		{
			elWizardContent.innerHTML = wrapWizardStepWithBanner(renderStepReviewSubmit());
		}
		else if (state.wizardStep === WIZARD_STEP_HISTORY)
		{
			elWizardContent.innerHTML = wrapWizardStepWithBanner(renderStepReviewHistory());
		}
		else if (state.wizardStep === WIZARD_STEP_VERSIONING)
		{
			elWizardContent.innerHTML = wrapWizardStepWithBanner(renderStepVersioning());
		}
	}

	function renderPage()
	{
		if (state.view === 'list')
		{
			elListView.classList.remove('d-none');
			elDetailView.classList.add('d-none');
			document.title = 'Budget Requests - Prototype';
			renderListView();
			bindListEvents();
			return;
		}

		elListView.classList.add('d-none');
		elDetailView.classList.remove('d-none');
		document.title = (sampleBudgetRequest.id ? 'View Budget Request' : 'New Budget Request') + ' - Prototype';
		elPageTitle.textContent = sampleBudgetRequest.id ? 'View Budget Request' : 'New Budget Request';
		renderDetailHeader();
		renderWizardStepper();
		renderWizardContent();
		renderContextPanel();
		renderFooterActions();
		bindDynamicEvents();
	}

	/* -- Version snapshot creation ------------------ */
	function createVersionSnapshot(strRemarks)
	{
		if (!isRequestEditable())
		{
			window.alert('This budget request cannot be submitted because it is no longer editable.');
			return;
		}

		var objTotals = computeRequestTotals();
		var strNow = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
		var strSubmittedBy = CURRENT_ACTOR_NAME;
		var blnResubmit = isRequestReturned();
		var strTargetStage = blnResubmit
			? (sampleBudgetRequest.currentStage || 'PDO Review')
			: 'PDO Review';
		var strWorkflowStage = blnResubmit
			? (sampleBudgetRequest.workflowStage || 'pdo')
			: 'pdo';

		if (!sampleBudgetRequest.referenceCode || sampleBudgetRequest.referenceCode.indexOf('Will be') >= 0)
		{
			sampleBudgetRequest.referenceCode = 'BR-2027-' + String(100 + sampleVersions.length + 1).slice(-3);
		}

		if (blnResubmit)
		{
			if (!sampleBudgetRequest.reviewHistory) sampleBudgetRequest.reviewHistory = [];
			sampleBudgetRequest.reviewHistory.push({
				date: strNow,
				user: strSubmittedBy,
				role: 'Requester',
				action: 'Resubmitted',
				reason: '-',
				target: 'Entire Request',
				remark: strRemarks || 'Resubmitted after revision.'
			});
			sampleBudgetRequest.returnReason = null;
		}

		var objVersion = {
			versionNumber: sampleVersions.length + 1,
			dateTime: strNow,
			userName: strSubmittedBy,
			userRole: 'Agency Name',
			status: 'Pending',
			currentStage: strTargetStage,
			remarks: strRemarks || (blnResubmit ? 'Resubmitted for review.' : 'Submitted for PDO review.'),
			snapshot: {
				general: {
					referenceNo: sampleBudgetRequest.referenceCode,
					title: state.form.title,
					description: state.form.description,
					submittedBy: strSubmittedBy,
					submittedDate: strNow,
					status: 'Pending',
					currentStage: strTargetStage
				},
				projects: JSON.parse(JSON.stringify(projects)),
				totals: objTotals
			}
		};

		sampleVersions.push(objVersion);
		sampleBudgetRequest.status = 'Pending';
		sampleBudgetRequest.currentStage = strTargetStage;
		sampleBudgetRequest.workflowStage = strWorkflowStage;
		sampleBudgetRequest.submittedBy = strSubmittedBy;
		sampleBudgetRequest.submittedAt = strNow;
		sampleBudgetRequest.id = 1;
		state.versionExpanded[getVersionExpandKey(objVersion.versionNumber)] = true;
		syncListItemFromRequest();
	}

	/* -- Event handlers ----------------------------- */
	function syncGeneralFormFromDom()
	{
		if (!canEditGeneralAndProjects()) return;

		var elTitle = document.getElementById('br-title');
		var elFiscalYear = document.getElementById('br-fiscal-year');
		var elDescription = document.getElementById('br-description');

		if (elTitle) state.form.title = elTitle.value;
		if (elFiscalYear) state.form.fiscalYear = elFiscalYear.value;
		if (elDescription) state.form.description = elDescription.value;
	}

	function syncAttachmentsFromDom()
	{
		if (!canEditAttachmentsJustification()) return;

		var elJustification = document.getElementById('br-justification');
		if (elJustification) state.justificationDraft = elJustification.value;
	}

	function bindDynamicEvents()
	{
		var elTitle = document.getElementById('br-title');
		var elFiscalYear = document.getElementById('br-fiscal-year');
		var elDescription = document.getElementById('br-description');

		if (elTitle)
		{
			elTitle.oninput = function()
			{
				if (!canEditGeneralAndProjects()) return;
				state.form.title = elTitle.value;
				renderDetailHeader();
			};
		}
		if (elFiscalYear)
		{
			elFiscalYear.onchange = function()
			{
				if (!canEditGeneralAndProjects()) return;
				state.form.fiscalYear = elFiscalYear.value;
			};
		}
		if (elDescription)
		{
			elDescription.oninput = function()
			{
				if (!canEditGeneralAndProjects()) return;
				state.form.description = elDescription.value;
			};
		}

		document.querySelectorAll('[data-wizard-step]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				syncGeneralFormFromDom();
				syncAttachmentsFromDom();
				state.wizardStep = Number(elBtn.getAttribute('data-wizard-step'));
				renderPage();
			};
		});

		var elNext = document.getElementById('btn-next-step');
		if (elNext)
		{
			elNext.onclick = function()
			{
				syncGeneralFormFromDom();
				state.wizardStep = WIZARD_STEP_PROJECTS;
				renderPage();
			};
		}

		var elSaveDraft = document.getElementById('btn-save-draft');
		if (elSaveDraft)
		{
			elSaveDraft.onclick = function()
			{
				if (!isRequestEditable()) return;
				syncGeneralFormFromDom();
				sampleBudgetRequest.referenceCode = 'BR-DRAFT-2027-001';
				window.alert('Draft saved successfully.');
			};
		}

		var elSubmit = document.getElementById('btn-submit-request');
		if (elSubmit)
		{
			elSubmit.onclick = function()
			{
				if (!isRequestEditable()) return;
				syncGeneralFormFromDom();
				syncAttachmentsFromDom();
				var blnResubmit = isRequestReturned();
				createVersionSnapshot(blnResubmit ? 'Resubmitted for PDO review.' : 'Submitted for PDO review.');
				state.wizardStep = WIZARD_STEP_VERSIONING;
				renderPage();
				window.alert('Budget request ' + (blnResubmit ? 'resubmitted' : 'submitted') + '. Version ' + sampleVersions.length + ' created. Status is now Pending at PDO Review.');
			};
		}

		var elCancelRequest = document.getElementById('btn-cancel-request');
		if (elCancelRequest)
		{
			elCancelRequest.onclick = function()
			{
				cancelBudgetRequest();
			};
		}

		var elAddFile = document.getElementById('btn-add-attachment-file');
		var elFileInput = document.getElementById('br-attachment-file-input');
		if (elAddFile && elFileInput)
		{
			elAddFile.onclick = function() { elFileInput.click(); };
			elFileInput.onchange = function()
			{
				if (!canEditAttachmentsJustification()) return;
				Array.prototype.forEach.call(elFileInput.files || [], function(objFile)
				{
					state.attachedFiles.push({
						id: 'file-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
						name: objFile.name,
						size: objFile.size,
						type: objFile.type || 'File',
						uploadedAt: getCurrentTimestampIso(),
						uploadedBy: getCurrentActorName()
					});
				});
				elFileInput.value = '';
				renderPage();
			};
		}

		document.querySelectorAll('[data-detach-file]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				if (!canEditAttachmentsJustification()) return;
				var strId = elBtn.getAttribute('data-detach-file');
				state.attachedFiles = state.attachedFiles.filter(function(f) { return f.id !== strId; });
				renderPage();
			};
		});

		var elJustification = document.getElementById('br-justification');
		if (elJustification)
		{
			elJustification.oninput = function()
			{
				state.justificationDraft = elJustification.value;
				var elPost = document.getElementById('btn-post-justification');
				if (elPost) elPost.disabled = !String(elJustification.value || '').trim();
				renderContextPanel();
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

		document.querySelectorAll('[data-project-id]').forEach(function(elCard)
		{
			elCard.onclick = function(evt)
			{
				if (evt.target.closest('[data-delete-project]')) return;
				state.selectedProjectId = elCard.getAttribute('data-project-id');
				renderPage();
			};
		});

		document.querySelectorAll('[data-delete-project]').forEach(function(elBtn)
		{
			elBtn.onclick = function(evt)
			{
				evt.stopPropagation();
				if (!canEditGeneralAndProjects()) return;
				var strId = elBtn.getAttribute('data-delete-project');
				if (projects.length <= 1)
				{
					window.alert('At least one project is required.');
					return;
				}
				projects = projects.filter(function(p) { return p.id !== strId; });
				if (state.selectedProjectId === strId)
				{
					state.selectedProjectId = projects[0].id;
				}
				renderPage();
			};
		});

		var elAddProject = document.getElementById('btn-add-project');
		if (elAddProject)
		{
			elAddProject.onclick = function()
			{
				if (!canEditGeneralAndProjects()) return;
				var objNewProject = createBlankProject();
				projects.push(objNewProject);
				state.selectedProjectId = objNewProject.id;
				state.projectMiniStep = PROJECT_STEP_INFO;
				renderPage();
			};
		}

		document.querySelectorAll('[data-project-step]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				state.projectMiniStep = elBtn.getAttribute('data-project-step');
				renderPage();
			};
		});

		document.querySelectorAll('[data-toggle-measure]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				var strMeasureId = elBtn.getAttribute('data-toggle-measure');
				var objProject = getSelectedProject();
				var objMeasure = objProject.physicalMeasures.find(function(m)
				{
					return m.measureId === strMeasureId;
				});
				if (objMeasure) objMeasure.expanded = !objMeasure.expanded;
				renderPage();
			};
		});

		document.querySelectorAll('[data-toggle-version-project]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				var intVersionNumber = Number(elBtn.getAttribute('data-version-number'));
				var strProjectId = elBtn.getAttribute('data-project-id');
				var strKey = getVersionProjectExpandKey(intVersionNumber, strProjectId);
				state.versionProjectExpanded[strKey] = !isVersionProjectExpanded(intVersionNumber, strProjectId);
				renderPage();
			};
		});

		document.querySelectorAll('[data-add-entry]').forEach(function(elBtn)
		{
			elBtn.onclick = function(evt)
			{
				evt.stopPropagation();
				if (!canEditGeneralAndProjects()) return;
				var strMeasureId = elBtn.getAttribute('data-add-entry');
				var objProject = getSelectedProject();
				var objMeasure = objProject.physicalMeasures.find(function(m)
				{
					return m.measureId === strMeasureId;
				});
				if (!objMeasure) return;

				objMeasure.entries.push({
					id: 'entry-' + Date.now(),
					particularValue: '',
					quantity: '',
					specification: '',
					othersText: ''
				});
				objMeasure.expanded = true;
				renderPage();
			};
		});

		document.querySelectorAll('[data-remove-entry]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				if (!canEditGeneralAndProjects()) return;
				var strMeasureId = elBtn.getAttribute('data-measure-id');
				var strEntryId = elBtn.getAttribute('data-entry-id');
				var objProject = getSelectedProject();
				var objMeasure = objProject.physicalMeasures.find(function(m)
				{
					return m.measureId === strMeasureId;
				});
				if (!objMeasure) return;

				objMeasure.entries = objMeasure.entries.filter(function(e)
				{
					return e.id !== strEntryId;
				});
				renderPage();
			};
		});

		document.querySelectorAll('[data-entry-particular]').forEach(function(elSelect)
		{
			elSelect.onchange = function()
			{
				var strMeasureId = elSelect.getAttribute('data-measure-id');
				var strEntryId = elSelect.getAttribute('data-entry-id');
				var objFound = findPhysicalMeasureEntry(getSelectedProject(), strMeasureId, strEntryId);
				if (!objFound.entry) return;

				objFound.entry.particularValue = elSelect.value;
				objFound.entry.specification = '';
				renderPage();
			};
		});

		document.querySelectorAll('[data-entry-qty]').forEach(function(elInput)
		{
			elInput.oninput = function()
			{
				var strMeasureId = elInput.getAttribute('data-measure-id');
				var strEntryId = elInput.getAttribute('data-entry-id');
				var objFound = findPhysicalMeasureEntry(getSelectedProject(), strMeasureId, strEntryId);
				if (objFound.entry) objFound.entry.quantity = elInput.value;
			};
		});

		document.querySelectorAll('[data-entry-spec]').forEach(function(elInput)
		{
			elInput.oninput = function()
			{
				var strMeasureId = elInput.getAttribute('data-measure-id');
				var strEntryId = elInput.getAttribute('data-entry-id');
				var objFound = findPhysicalMeasureEntry(getSelectedProject(), strMeasureId, strEntryId);
				if (objFound.entry) objFound.entry.specification = elInput.value;
			};
		});

		document.querySelectorAll('[data-entry-others]').forEach(function(elInput)
		{
			elInput.oninput = function()
			{
				var strMeasureId = elInput.getAttribute('data-measure-id');
				var strEntryId = elInput.getAttribute('data-entry-id');
				var objFound = findPhysicalMeasureEntry(getSelectedProject(), strMeasureId, strEntryId);
				if (objFound.entry) objFound.entry.othersText = elInput.value;
			};
		});

		document.querySelectorAll('[data-project-field]').forEach(function(elField)
		{
			elField.onchange = function()
			{
				var objProject = getSelectedProject();
				var strField = elField.getAttribute('data-project-field');
				objProject[strField] = elField.value;
				renderPage();
			};
		});

		function toggleSummaryPanel()
		{
			state.summaryPanelVisible = !state.summaryPanelVisible;
			renderPage();
		}

		var elToggleSummary = document.getElementById('btn-toggle-summary');
		if (elToggleSummary)
		{
			elToggleSummary.onclick = toggleSummaryPanel;
		}

		var elShowSummary = document.getElementById('btn-show-summary');
		if (elShowSummary)
		{
			elShowSummary.onclick = toggleSummaryPanel;
		}

		var elAddExpense = document.getElementById('btn-add-expense');
		if (elAddExpense)
		{
			elAddExpense.onclick = openExpenseModalForAdd;
		}

		document.querySelectorAll('[data-edit-expense]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				var strId = elBtn.getAttribute('data-edit-expense');
				var objProject = getSelectedProject();
				var objItem = objProject.lineItems.find(function(i) { return i.id === strId; });
				if (!objItem) return;
				openExpenseModalForEdit(objItem);
			};
		});

		document.querySelectorAll('[data-delete-expense]').forEach(function(elBtn)
		{
			elBtn.onclick = function()
			{
				var strId = elBtn.getAttribute('data-delete-expense');
				var objProject = getSelectedProject();
				objProject.lineItems = objProject.lineItems.filter(function(i) { return i.id !== strId; });
				renderPage();
			};
		});
	}

	function bindShellEvents()
	{
		document.getElementById('btn-back').onclick = function()
		{
			openListView();
		};

		document.getElementById('btn-nav-home').onclick = function(evt)
		{
			evt.preventDefault();
			openListView();
		};

		document.getElementById('btn-nav-budget-requests').onclick = function(evt)
		{
			evt.preventDefault();
			openListView();
		};

		document.getElementById('btn-save-expense').onclick = function()
		{
			var strCat = document.getElementById('expense-category').value;
			var dblAmt = Number(document.getElementById('expense-amount').value) || 0;
			var strDesc = '';
			var strExpenseValue = '';

			if (strCat === 'CO')
			{
				strDesc = document.getElementById('expense-description').value.trim();
				if (!strDesc || dblAmt <= 0)
				{
					return;
				}
			}
			else
			{
				strExpenseValue = document.getElementById('expense-item-select').value;
				if (!strExpenseValue || dblAmt <= 0)
				{
					return;
				}
				strDesc = getExpenseItemLabel(strCat, strExpenseValue);
			}

			var objProject = getSelectedProject();
			if (state.editingExpenseId)
			{
				var objExisting = objProject.lineItems.find(function(i) { return i.id === state.editingExpenseId; });
				if (objExisting)
				{
					objExisting.description = strDesc;
					objExisting.category = strCat;
					objExisting.expenseItemValue = strExpenseValue;
					objExisting.amount = dblAmt;
				}
			}
			else
			{
				objProject.lineItems.push({
					id: 'li-' + Date.now(),
					description: strDesc,
					category: strCat,
					expenseItemValue: strExpenseValue,
					amount: dblAmt
				});
			}

			expenseModal.hide();
			state.editingExpenseId = null;
			renderPage();
		};

		document.getElementById('expense-category').onchange = syncExpenseModalFields;
	}

	function init()
	{
		loadStoredWorkflowState();
		expenseModal = new bootstrap.Modal(document.getElementById('expense-item-modal'));
		bindShellEvents();
		renderPage();
	}

	init();
	}());
