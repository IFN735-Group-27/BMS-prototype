/**
*System Name: Budget Management System
*Module Name: dashboard_app
*
*Purpose of this file:
*Financial Dashboard prototype — planning and monitoring tabs, filters,
*Chart.js charts and performance summary table.
*
*Author: none
*
*Copyright (C) 2026
*by the Department of Science and Technology - Central Office
*
*All rights reserved.
*/

(function ()
{
	'use strict';

	var escapeHtml = PrototypeUi.escapeHtml;
	var formatCurrency = PrototypeUi.formatCurrency;

	var TAB_PLANNING = 'planning';
	var TAB_MONITORING = 'monitoring';
	var TAB_PHYSICAL = 'physical';

	var RATE_GOOD_MIN = 90;
	var RATE_WARN_MIN = 75;

	/* Deeper professional palette (previous pastel set kept for reference):
	   appropriation #AFCBFF, allotment #CDB4FF, obligation #B8F2E6,
	   disbursement #FFD6A5, tag #FBCFE8 */
	var PASTEL_COLORS = {
		appropriation: '#3D6BB3',
		allotment: '#6F5AA8',
		obligation: '#2E8B6E',
		disbursement: '#D98E32',
		ps: '#3D6BB3',
		mooe: '#D98E32',
		co: '#2E8B6E',
		tag: '#B85C8B'
	};

	var PERFORMANCE_COLUMNS = [
		{ key: 'agencyName', label: 'Agency Name', type: 'text' },
		{ key: 'appropriation', label: 'Appropriation', type: 'currency' },
		{ key: 'allotment', label: 'Allotment', type: 'currency' },
		{ key: 'obligation', label: 'Obligation', type: 'currency' },
		{ key: 'disbursement', label: 'Disbursement', type: 'currency' },
		{ key: 'executionRate', label: 'Execution Rate', type: 'rate' },
		{ key: 'disbursementRate', label: 'Disbursement Rate', type: 'rate' },
		{ key: 'absorptionRate', label: 'Absorption Rate', type: 'rate' }
	];

	var state = {
		activeTab: TAB_PLANNING,
		sortKey: 'agencyName',
		sortDir: 'asc',
		planningSortKey: 'agencyName',
		planningSortDir: 'asc',
		particularMeasure: 'publication'
	};

	var charts = {};

	var elRoot = document.getElementById('db-app-root');

	/* -- Formatting helpers -------------------------- */

	//this function formats a percentage value like "93.97%"
	function formatRate(numValue)
	{
		return (Number(numValue) || 0).toFixed(2) + '%';
	}

	//this function maps a rate to its traffic-light css class
	function getRateClassName(numValue)
	{
		if (numValue >= RATE_GOOD_MIN)
		{
			return 'dashboard-rate--green';
		}

		if (numValue >= RATE_WARN_MIN)
		{
			return 'dashboard-rate--amber';
		}

		return 'dashboard-rate--red';
	}

	/* -- Filters ------------------------------------- */

	//this function renders one filter dropdown column
	function renderFilterSelect(strId, strLabel, arrOptions, strPlaceholder, strColClass)
	{
		var strHtml = '<div class="' + strColClass + '">';

		strHtml += '<label class="form-label dashboard-filter-label" for="' + strId + '">' + escapeHtml(strLabel) + '</label>';
		strHtml += '<select class="form-select form-select-sm" id="' + strId + '">';

		if (strPlaceholder)
		{
			strHtml += '<option value="">' + escapeHtml(strPlaceholder) + '</option>';
		}

		arrOptions.forEach(function(objOption)
		{
			strHtml += '<option value="' + escapeHtml(objOption.value) + '">' + escapeHtml(objOption.label) + '</option>';
		});

		strHtml += '</select></div>';
		return strHtml;
	}

	//this function renders the filter bar for the active tab
	//planning adds the status filter, physical swaps allotment case for physical measure
	function renderFilters()
	{
		var strThirdFilter = renderFilterSelect('db-filter-allotment-case', 'Allotment Case', sampleDashboardFilters.allotmentCases, 'All Allotment Cases', 'col-lg-2 col-md-4');
		var strLastFilter = '';

		if (state.activeTab === TAB_PLANNING)
		{
			strLastFilter = renderFilterSelect('db-filter-request-status', 'Status', sampleDashboardFilters.statuses, 'All Statuses', 'col-lg-2 col-md-4');
		}

		if (state.activeTab === TAB_PHYSICAL)
		{
			strThirdFilter = '';
			strLastFilter = renderFilterSelect('db-filter-physical-measure', 'Physical Measure', sampleDashboardPhysical.physicalMeasures, 'All Physical Measures', 'col-lg-2 col-md-4');
		}

		return '<div class="br-card dashboard-filters mb-4">' +
			'<div class="row g-3 align-items-end">' +
				renderFilterSelect('db-filter-fy', 'Fiscal Year', sampleDashboardFilters.fiscalYears, 'All Fiscal Years', 'col-lg-2 col-md-4') +
				renderFilterSelect('db-filter-pillar', 'Pillar', sampleDashboardFilters.pillars, 'All Pillars', 'col-lg-2 col-md-4') +
				strThirdFilter +
				renderFilterSelect('db-filter-agency-category', 'Agency Category', sampleDashboardFilters.agencyCategories, 'All Agency Categories', 'col-lg-2 col-md-4') +
				renderFilterSelect('db-filter-agency-name', 'Agency Name', sampleDashboardFilters.agencyNames, 'All Agencies', 'col-lg-2 col-md-4') +
				strLastFilter +
				'<div class="col-lg-1 col-md-6">' + PrototypeUi.renderPrimaryButton('Apply', { id: 'btn-db-apply', className: 'w-100' }) + '</div>' +
				'<div class="col-lg-1 col-md-6">' + PrototypeUi.renderSecondaryButton('Clear', { id: 'btn-db-clear', className: 'w-100' }) + '</div>' +
			'</div>' +
		'</div>';
	}

	/* -- Tabs ---------------------------------------- */

	//this function renders the planning/monitoring tab bar
	function renderTabs()
	{
		var arrTabs = [
			{ id: TAB_PLANNING, label: 'Budget Planning & Status' },
			{ id: TAB_MONITORING, label: 'Budget Execution Monitoring' },
			{ id: TAB_PHYSICAL, label: 'Physical Plans & Accomplishments' }
		];
		var strHtml = '<div class="dashboard-tabs" role="tablist">';

		arrTabs.forEach(function(objTab)
		{
			var strActiveClass = (state.activeTab === objTab.id) ? ' dashboard-tabs__btn--active' : '';

			strHtml += '<button type="button" class="dashboard-tabs__btn' + strActiveClass + '" data-tab="' + objTab.id + '" role="tab">' +
				escapeHtml(objTab.label) +
			'</button>';
		});

		strHtml += '</div>';
		return strHtml;
	}

	/* -- Planning tab -------------------------------- */

	//this function counts budget requests per status from the shared mock list
	function buildStatusSummary()
	{
		var objCounts = { pending: 0, returned: 0, reviewed: 0, consolidated: 0 };
		var arrRequests = (typeof BUDGET_REQUESTS_LIST !== 'undefined') ? BUDGET_REQUESTS_LIST : [];

		arrRequests.forEach(function(objRequest)
		{
			var strStatus = String(objRequest.status || '').toLowerCase();

			if (objCounts[strStatus] !== undefined)
			{
				objCounts[strStatus] += 1;
			}
		});

		return [
			{ status: 'pending', label: 'Pending', value: objCounts.pending },
			{ status: 'returned', label: 'Returned', value: objCounts.returned },
			{ status: 'reviewed', label: 'Reviewed', value: objCounts.reviewed },
			{ status: 'consolidated', label: 'Consolidated', value: objCounts.consolidated }
		];
	}

	//this function renders the four budget request status cards
	function renderStatusCards()
	{
		var arrStatusSummary = buildStatusSummary();
		var strHtml = '<section class="dashboard-section" aria-label="Budget request status">';

		strHtml += '<h5 class="dashboard-section__title mb-3">Budget Request Status</h5>';
		strHtml += '<div class="row g-3">';

		arrStatusSummary.forEach(function(objStatus)
		{
			strHtml += '<div class="col-sm-6 col-xl-3">' +
				'<div class="dashboard-status-card dashboard-status-card--' + objStatus.status + '">' +
					'<span class="status-badge status-badge--' + objStatus.status + '">' + escapeHtml(objStatus.label) + '</span>' +
					'<p class="dashboard-status-card__value mb-0">' + objStatus.value + '</p>' +
				'</div>' +
			'</div>';
		});

		strHtml += '</div></section>';
		return strHtml;
	}

	//this function renders the budget amount breakdown panel with two bar charts
	function renderCategoryBreakdown()
	{
		return '<section class="dashboard-section" aria-label="Budget amount breakdown">' +
			'<h5 class="dashboard-section__title mb-3">Budget Amount Breakdown</h5>' +
			'<div class="br-card">' +
				'<div class="dashboard-panel__toolbar">' +
					'<div class="row g-3">' +
						renderFilterSelect('db-filter-status', 'Budget Status', sampleDashboardFilters.budgetStatuses, '', 'col-md-4') +
					'</div>' +
				'</div>' +
				'<div class="row g-3">' +
					'<div class="col-lg-6">' +
						'<div class="dashboard-chart-card">' +
							'<div class="dashboard-panel__chart-title">Budget request plan by pillars and allotment case</div>' +
							'<div class="dashboard-chart dashboard-chart--small"><canvas id="db-chart-requests"></canvas></div>' +
						'</div>' +
					'</div>' +
					'<div class="col-lg-6">' +
						'<div class="dashboard-chart-card">' +
							'<div class="dashboard-panel__chart-title">Unified budget plan by pillars and allotment case</div>' +
							'<div class="dashboard-chart dashboard-chart--small"><canvas id="db-chart-unified"></canvas></div>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</section>';
	}

	//this function returns planning summary rows with computed totals, sorted
	function getSortedPlanningSummaryRows()
	{
		var arrRows = sampleDashboardPlanning.planningSummaryRows.map(function(objRow)
		{
			return {
				agencyName: objRow.agencyName,
				pillarCnt: objRow.pillarCnt,
				projectCnt: objRow.projectCnt,
				ps: objRow.ps,
				mooe: objRow.mooe,
				co: objRow.co,
				totalPlanned: objRow.ps + objRow.mooe + objRow.co
			};
		});

		arrRows.sort(function(objA, objB)
		{
			var left = objA[state.planningSortKey];
			var right = objB[state.planningSortKey];
			var intResult;

			if ((typeof left === 'number') && (typeof right === 'number'))
			{
				intResult = left - right;
			}
			else
			{
				intResult = String(left || '').localeCompare(String(right || ''), undefined, { numeric: true, sensitivity: 'base' });
			}

			return (state.planningSortDir === 'desc') ? -intResult : intResult;
		});

		return arrRows;
	}

	//this function renders one planning summary header cell
	function renderPlanningSummaryHeader(strKey, strLabel, strAlignClass)
	{
		var strArrow = '';
		var strClass = strAlignClass || '';

		if (strKey)
		{
			strClass += ' br-table__sortable';

			if (state.planningSortKey === strKey)
			{
				strArrow = (state.planningSortDir === 'asc') ? ' ▲' : ' ▼';
			}

			return '<th class="' + strClass + '" data-plan-sort-key="' + strKey + '">' + escapeHtml(strLabel) + strArrow + '</th>';
		}

		return '<th class="' + strClass + '">' + escapeHtml(strLabel) + '</th>';
	}

	//this function renders the agency-level planning summary table
	function renderPlanningSummaryTable()
	{
		var arrRows = getSortedPlanningSummaryRows();
		var strHtml = '<section class="dashboard-section" aria-label="Planning summary by agency">';

		strHtml += '<h5 class="dashboard-section__title mb-3">Planning Summary by Agency</h5>';
		strHtml += '<div class="br-card"><div class="br-table-wrap"><table class="br-table"><thead><tr>' +
			renderPlanningSummaryHeader('agencyName', 'Agency Name', '') +
			renderPlanningSummaryHeader('pillarCnt', 'No. of Pillars', 'text-center') +
			renderPlanningSummaryHeader('projectCnt', 'No. of Projects', 'text-center') +
			renderPlanningSummaryHeader('', 'PS', 'text-end') +
			renderPlanningSummaryHeader('', 'MOOE', 'text-end') +
			renderPlanningSummaryHeader('', 'CO', 'text-end') +
			renderPlanningSummaryHeader('totalPlanned', 'Total Planned Amount', 'text-end') +
		'</tr></thead><tbody>';

		arrRows.forEach(function(objRow)
		{
			strHtml += '<tr>' +
				'<td class="fw-semibold">' + escapeHtml(objRow.agencyName) + '</td>' +
				'<td class="text-center">' + objRow.pillarCnt + '</td>' +
				'<td class="text-center">' + objRow.projectCnt + '</td>' +
				'<td class="text-end">' + formatCurrency(objRow.ps) + '</td>' +
				'<td class="text-end">' + formatCurrency(objRow.mooe) + '</td>' +
				'<td class="text-end">' + formatCurrency(objRow.co) + '</td>' +
				'<td class="text-end fw-semibold">' + formatCurrency(objRow.totalPlanned) + '</td>' +
			'</tr>';
		});

		strHtml += '</tbody></table></div></div></section>';
		return strHtml;
	}

	//this function renders the planning tab content
	function renderPlanningTab()
	{
		return renderStatusCards() + renderCategoryBreakdown() + renderPlanningSummaryTable();
	}

	/* -- Monitoring tab ------------------------------ */

	//this function renders the four execution amount metric cards
	function renderSummaryCards()
	{
		var strHtml = '<section class="dashboard-section" aria-label="Budget execution amount">';

		strHtml += '<h5 class="dashboard-section__title mb-3">Budget Execution Amount</h5>';
		strHtml += '<div class="row g-3">';

		sampleDashboardMonitoring.summaryCards.forEach(function(objCard)
		{
			var strAccent = PASTEL_COLORS[objCard.key] || '#6c757d';

			strHtml += '<div class="col-sm-6 col-xl-3">' +
				'<div class="dashboard-metric-card" style="--metric-accent: ' + strAccent + ';">' +
					'<p class="dashboard-metric-card__label mb-1">' + escapeHtml(objCard.label) + '</p>' +
					'<p class="dashboard-metric-card__value mb-1">' + formatCurrency(objCard.value) + '</p>' +
					'<p class="dashboard-metric-card__subtitle mb-0">Filtered Result</p>' +
				'</div>' +
			'</div>';
		});

		strHtml += '</div></section>';
		return strHtml;
	}

	//this function renders the trend line chart panel
	function renderTrendSection()
	{
		return '<section class="dashboard-section" aria-label="Budget execution trend">' +
			'<h5 class="dashboard-section__title mb-3">Budget Execution Trend</h5>' +
			'<div class="br-card">' +
				'<div class="dashboard-chart"><canvas id="db-chart-trend"></canvas></div>' +
			'</div>' +
		'</section>';
	}

	//this function renders the two variance bar chart panels
	//formula legends are shown as static notes instead of chart legends
	function renderVarianceSection()
	{
		return '<section class="dashboard-section" aria-label="Variance charts">' +
			'<div class="row g-3">' +
				'<div class="col-md-6 d-flex flex-column">' +
					'<h5 class="dashboard-section__title mb-3">Released Amount Variance</h5>' +
					'<div class="br-card flex-grow-1">' +
						'<p class="dashboard-chart-note mb-2">Released Amount = Appropriation − Allotment</p>' +
						'<div class="dashboard-chart dashboard-chart--small"><canvas id="db-chart-released"></canvas></div>' +
					'</div>' +
				'</div>' +
				'<div class="col-md-6 d-flex flex-column">' +
					'<h5 class="dashboard-section__title mb-3">Execution Amount Variance</h5>' +
					'<div class="br-card flex-grow-1">' +
						'<p class="dashboard-chart-note mb-2">Execution Amount = Allotment − Obligation</p>' +
						'<div class="dashboard-chart dashboard-chart--small"><canvas id="db-chart-execution"></canvas></div>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</section>';
	}

	//this function returns performance rows sorted by the active column
	function getSortedPerformanceRows()
	{
		var arrRows = sampleDashboardMonitoring.performanceRows.slice();

		arrRows.sort(function(objA, objB)
		{
			var left = objA[state.sortKey];
			var right = objB[state.sortKey];
			var intResult;

			if ((typeof left === 'number') && (typeof right === 'number'))
			{
				intResult = left - right;
			}
			else
			{
				intResult = String(left || '').localeCompare(String(right || ''), undefined, { numeric: true, sensitivity: 'base' });
			}

			return (state.sortDir === 'desc') ? -intResult : intResult;
		});

		return arrRows;
	}

	//this function renders one performance table cell by column type
	function renderPerformanceCell(objColumn, objRow)
	{
		var value = objRow[objColumn.key];

		if (objColumn.type === 'currency')
		{
			return '<td class="text-end">' + formatCurrency(value) + '</td>';
		}

		if (objColumn.type === 'rate')
		{
			return '<td class="text-end"><span class="' + getRateClassName(value) + '">' + formatRate(value) + '</span></td>';
		}

		return '<td>' + escapeHtml(value) + '</td>';
	}

	//this function renders the performance summary table
	function renderPerformanceTable()
	{
		var arrRows = getSortedPerformanceRows();
		var strHtml = '<section class="dashboard-section" aria-label="Performance summary by agency">';

		strHtml += '<h5 class="dashboard-section__title mb-3">Performance Summary by Agency</h5>';
		strHtml += '<div class="br-card"><div class="br-table-wrap"><table class="br-table"><thead><tr>';

		PERFORMANCE_COLUMNS.forEach(function(objColumn)
		{
			var strArrow = '';

			if (state.sortKey === objColumn.key)
			{
				strArrow = (state.sortDir === 'asc') ? ' ▲' : ' ▼';
			}

			strHtml += '<th class="br-table__sortable" data-sort-key="' + objColumn.key + '">' + escapeHtml(objColumn.label) + strArrow + '</th>';
		});

		strHtml += '</tr></thead><tbody>';

		if (arrRows.length === 0)
		{
			strHtml += '<tr><td colspan="' + PERFORMANCE_COLUMNS.length + '" class="text-center text-muted py-4">No monitoring records found for the selected filters.</td></tr>';
		}

		arrRows.forEach(function(objRow)
		{
			strHtml += '<tr>';
			PERFORMANCE_COLUMNS.forEach(function(objColumn)
			{
				strHtml += renderPerformanceCell(objColumn, objRow);
			});
			strHtml += '</tr>';
		});

		strHtml += '</tbody></table></div></div></section>';
		return strHtml;
	}

	//this function renders the monitoring tab content
	function renderMonitoringTab()
	{
		return renderSummaryCards() + renderTrendSection() + renderVarianceSection() + renderPerformanceTable();
	}

	/* -- Physical Plans & Accomplishments tab (US38) -- */

	//this function renders the four physical kpi cards
	function renderPhysicalKpiCards()
	{
		var arrAccents = [PASTEL_COLORS.appropriation, PASTEL_COLORS.allotment, PASTEL_COLORS.obligation, PASTEL_COLORS.disbursement];
		var strHtml = '<section class="dashboard-section" aria-label="Physical plans and accomplishments summary">';

		strHtml += '<h5 class="dashboard-section__title mb-3">Physical Plans &amp; Accomplishments</h5>';
		strHtml += '<div class="row g-3">';

		sampleDashboardPhysical.kpiCards.forEach(function(objCard, intIndex)
		{
			strHtml += '<div class="col-sm-6 col-xl-3">' +
				'<div class="dashboard-metric-card" style="--metric-accent: ' + arrAccents[intIndex] + ';">' +
					'<p class="dashboard-metric-card__label mb-1">' + escapeHtml(objCard.label) + '</p>' +
					'<p class="dashboard-metric-card__value mb-1">' + escapeHtml(objCard.value) + '</p>' +
					'<p class="dashboard-metric-card__subtitle mb-0">' + escapeHtml(objCard.subtitle) + '</p>' +
				'</div>' +
			'</div>';
		});

		strHtml += '</div></section>';
		return strHtml;
	}

	//this function renders the physical measure dropdown inside the particular card
	function renderParticularMeasureSelect()
	{
		var strHtml = '<div class="d-flex align-items-center gap-2">';

		strHtml += '<label class="dashboard-filter-label mb-0" for="db-particular-measure">Physical Measure:</label>';
		strHtml += '<select class="form-select form-select-sm w-auto" id="db-particular-measure">';

		sampleDashboardPhysical.physicalMeasures.forEach(function(objMeasure)
		{
			var strSelected = (objMeasure.value === state.particularMeasure) ? ' selected' : '';

			strHtml += '<option value="' + escapeHtml(objMeasure.value) + '"' + strSelected + '>' + escapeHtml(objMeasure.label) + '</option>';
		});

		strHtml += '</select></div>';
		return strHtml;
	}

	//this function renders the physical plan overview section (charts 1-3)
	function renderPhysicalPlanOverview()
	{
		return '<section class="dashboard-section" aria-label="Physical plan overview">' +
			'<h5 class="dashboard-section__title mb-3">Physical Plan Overview</h5>' +
			'<div class="row g-3 mb-3">' +
				'<div class="col-lg-6 d-flex flex-column">' +
					'<div class="br-card flex-grow-1">' +
						'<div class="dashboard-panel__chart-title">Projects Planned by Pillar</div>' +
						'<div class="dashboard-chart dashboard-chart--small"><canvas id="db-chart-projects-pillar"></canvas></div>' +
					'</div>' +
				'</div>' +
				'<div class="col-lg-6 d-flex flex-column">' +
					'<div class="br-card flex-grow-1">' +
						'<div class="dashboard-panel__chart-title">Planned Quantity by Physical Measure</div>' +
						'<div class="dashboard-chart dashboard-chart--small"><canvas id="db-chart-planned-measure"></canvas></div>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<div class="br-card">' +
				'<div class="d-flex justify-content-between align-items-center flex-wrap gap-2 dashboard-panel__toolbar">' +
					'<div class="dashboard-panel__chart-title mb-0">Particular Breakdown</div>' +
					renderParticularMeasureSelect() +
				'</div>' +
				'<div class="dashboard-chart dashboard-chart--small"><canvas id="db-chart-particulars"></canvas></div>' +
			'</div>' +
		'</section>';
	}

	//this function renders the physical accomplishment monitoring section (charts 4-5)
	function renderPhysicalAccomplishmentSection()
	{
		return '<section class="dashboard-section" aria-label="Physical accomplishment monitoring">' +
			'<h5 class="dashboard-section__title mb-3">Physical Accomplishment Monitoring</h5>' +
			'<div class="row g-3">' +
				'<div class="col-lg-7 d-flex flex-column">' +
					'<div class="br-card flex-grow-1">' +
						'<div class="dashboard-panel__chart-title">Planned vs Accomplished by Physical Measure</div>' +
						'<div class="dashboard-chart"><canvas id="db-chart-planned-accomplished"></canvas></div>' +
					'</div>' +
				'</div>' +
				'<div class="col-lg-5 d-flex flex-column">' +
					'<div class="br-card flex-grow-1">' +
						'<div class="dashboard-panel__chart-title">Achievement Rate by Pillar</div>' +
						'<div class="dashboard-chart"><canvas id="db-chart-achievement-pillar"></canvas></div>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</section>';
	}

	//this function renders the project-level physical accomplishment table
	function renderPhysicalDetailTable()
	{
		var strHtml = '<section class="dashboard-section" aria-label="Project-level physical accomplishment details">';

		strHtml += '<h5 class="dashboard-section__title mb-3">Project-level Physical Accomplishment Details</h5>';
		strHtml += '<div class="br-card"><div class="br-table-wrap"><table class="br-table"><thead><tr>' +
			'<th>Project</th><th>Agency Name</th><th>Pillar</th><th>Physical Measure</th><th>Particular</th>' +
			'<th class="text-end">Planned Quantity</th><th class="text-end">Accomplished Quantity</th>' +
			'<th class="text-end">Variance</th><th class="text-end">Achievement Rate</th><th>Last Updated</th>' +
		'</tr></thead><tbody>';

		sampleDashboardPhysical.projectRows.forEach(function(objRow)
		{
			strHtml += '<tr>' +
				'<td class="fw-semibold">' + escapeHtml(objRow.project) + '</td>' +
				'<td>' + escapeHtml(objRow.agencyName) + '</td>' +
				'<td>' + escapeHtml(objRow.pillar) + '</td>' +
				'<td>' + escapeHtml(objRow.physicalMeasure) + '</td>' +
				'<td>' + escapeHtml(objRow.particular) + '</td>' +
				'<td class="text-end">' + objRow.plannedQty + '</td>' +
				'<td class="text-end">' + objRow.accomplishedQty + '</td>' +
				'<td class="text-end">' + objRow.variance + '</td>' +
				'<td class="text-end"><span class="' + getRateClassName(objRow.achievementRate) + '">' + formatRate(objRow.achievementRate) + '</span></td>' +
				'<td>' + (objRow.lastUpdated ? escapeHtml(objRow.lastUpdated) : '—') + '</td>' +
			'</tr>';
		});

		strHtml += '</tbody></table></div></div></section>';
		return strHtml;
	}

	//this function renders the physical tab content
	function renderPhysicalTab()
	{
		return renderPhysicalKpiCards() + renderPhysicalPlanOverview() + renderPhysicalAccomplishmentSection() + renderPhysicalDetailTable();
	}

	/* -- Charts -------------------------------------- */

	//this function returns shared Chart.js options
	function buildChartOptions(blnShowLegend)
	{
		return {
			responsive: true,
			maintainAspectRatio: false,
			interaction: { mode: 'index', intersect: false },
			plugins: {
				legend: {
					display: (blnShowLegend !== false),
					position: 'top',
					align: 'end',
					labels: {
						boxWidth: 10,
						boxHeight: 10,
						usePointStyle: true,
						pointStyle: 'rectRounded',
						padding: 16
					}
				}
			},
			scales: {
				x: {
					grid: { display: false },
					border: { display: false },
					ticks: { maxRotation: 0 }
				},
				y: {
					border: { display: false },
					grid: { drawTicks: false },
					ticks: { padding: 8 }
				}
			}
		};
	}

	//this function destroys a chart instance if it exists
	function destroyChart(strKey)
	{
		if (charts[strKey])
		{
			charts[strKey].destroy();
			charts[strKey] = null;
		}
	}

	//this function creates a horizontal stacked chart by pillar and allotment case
	function buildPillarStackedChart(strCanvasId, strKey, arrDatasets)
	{
		var elCanvas = document.getElementById(strCanvasId);
		var objOptions = buildChartOptions(true);
		var arrColors = [PASTEL_COLORS.ps, PASTEL_COLORS.mooe, PASTEL_COLORS.co];

		if (!elCanvas)
		{
			return;
		}

		//horizontal stacked bars: amount on the x-axis, pillars on the y-axis
		objOptions.indexAxis = 'y';
		objOptions.scales = {
			x: {
				stacked: true,
				border: { display: false },
				grid: { drawTicks: false },
				ticks: { padding: 8 }
			},
			y: {
				stacked: true,
				grid: { display: false },
				border: { display: false },
				ticks: { autoSkip: false }
			}
		};

		//axis shows short pillar names; tooltip title shows the full name
		objOptions.plugins.tooltip = {
			callbacks: {
				title: function(arrItems)
				{
					var intIdx = arrItems[0].dataIndex;
					return sampleDashboardPlanning.budgetByPillar.labels[intIdx];
				}
			}
		};

		destroyChart(strKey);
		charts[strKey] = new Chart(elCanvas, {
			type: 'bar',
			data: {
				labels: sampleDashboardPlanning.budgetByPillar.labelsShort,
				datasets: arrDatasets.map(function(objDataset, intIndex)
				{
					return {
						label: objDataset.label,
						data: objDataset.data,
						backgroundColor: arrColors[intIndex]
					};
				})
			},
			options: objOptions
		});
	}

	//this function creates the planning tab charts
	function buildPlanningCharts()
	{
		var objBudgetByPillar = sampleDashboardPlanning.budgetByPillar;

		buildPillarStackedChart('db-chart-requests', 'requests', objBudgetByPillar.budgetRequests);
		buildPillarStackedChart('db-chart-unified', 'unified', objBudgetByPillar.unifiedBudget);
	}

	//this function creates the monitoring tab charts
	function buildMonitoringCharts()
	{
		var elTrendCanvas = document.getElementById('db-chart-trend');
		var arrTrend = sampleDashboardMonitoring.trend;

		if (elTrendCanvas)
		{
			destroyChart('trend');
			charts.trend = new Chart(elTrendCanvas, {
				type: 'line',
				data: {
					labels: arrTrend.map(function(objRow) { return objRow.year; }),
					datasets: [
						{ label: 'Appropriation', data: arrTrend.map(function(objRow) { return objRow.appropriation; }), borderColor: PASTEL_COLORS.appropriation, backgroundColor: PASTEL_COLORS.appropriation },
						{ label: 'Allotment', data: arrTrend.map(function(objRow) { return objRow.allotment; }), borderColor: PASTEL_COLORS.allotment, backgroundColor: PASTEL_COLORS.allotment },
						{ label: 'Obligation', data: arrTrend.map(function(objRow) { return objRow.obligation; }), borderColor: PASTEL_COLORS.obligation, backgroundColor: PASTEL_COLORS.obligation },
						{ label: 'Disbursement', data: arrTrend.map(function(objRow) { return objRow.disbursement; }), borderColor: PASTEL_COLORS.disbursement, backgroundColor: PASTEL_COLORS.disbursement }
					]
				},
				options: buildChartOptions()
			});
		}

		buildPillarStackedChart('db-chart-released', 'released', sampleDashboardMonitoring.releasedVariance);
		buildPillarStackedChart('db-chart-execution', 'execution', sampleDashboardMonitoring.executionVariance);
	}

	//this function returns a pastel color per bar, cycling the palette
	function buildBarColors(intCount)
	{
		var arrPalette = [PASTEL_COLORS.ps, PASTEL_COLORS.mooe, PASTEL_COLORS.co, PASTEL_COLORS.tag, PASTEL_COLORS.allotment];
		var arrColors = [];
		var intIdx = 0;

		for (intIdx = 0; intIdx < intCount; intIdx++)
		{
			arrColors.push(arrPalette[intIdx % arrPalette.length]);
		}

		return arrColors;
	}

	//this function returns Chart.js options for horizontal bar charts
	function buildHorizontalChartOptions(blnShowLegend, blnPercentAxis)
	{
		var objOptions = buildChartOptions(blnShowLegend);

		objOptions.indexAxis = 'y';
		objOptions.scales = {
			x: {
				border: { display: false },
				grid: { drawTicks: false },
				ticks: { padding: 8 }
			},
			y: {
				grid: { display: false },
				border: { display: false }
			}
		};

		if (blnPercentAxis === true)
		{
			objOptions.scales.x.max = 100;
			objOptions.scales.x.ticks.callback = function(numValue) { return numValue + '%'; };
		}

		return objOptions;
	}

	//this function creates one horizontal bar chart on the given canvas
	function buildHorizontalBarChart(strCanvasId, strKey, strLabel, arrLabels, arrValues, blnPercentAxis, strBarColor)
	{
		var elCanvas = document.getElementById(strCanvasId);

		if (!elCanvas)
		{
			return;
		}

		destroyChart(strKey);
		charts[strKey] = new Chart(elCanvas, {
			type: 'bar',
			data: {
				labels: arrLabels,
				datasets: [
					{
						label: strLabel,
						data: arrValues,
						backgroundColor: strBarColor || PASTEL_COLORS.ps
					}
				]
			},
			options: buildHorizontalChartOptions(false, blnPercentAxis)
		});
	}

	//this function creates the planned quantity pie chart by physical measure
	function buildPlannedMeasurePieChart()
	{
		var MIN_PERCENT_LABEL = 6;
		var elCanvas = document.getElementById('db-chart-planned-measure');
		var objPlannedByMeasure = sampleDashboardPhysical.plannedByMeasure;
		var objPercentageLabelsPlugin = {
			id: 'physicalMeasurePercentageLabels',
			afterDatasetsDraw: function(objChart)
			{
				var objContext = objChart.ctx;
				var arrValues = objChart.data.datasets[0].data;
				var dblTotal = arrValues.reduce(function(dblSum, numValue) { return dblSum + Number(numValue || 0); }, 0);

				objChart.getDatasetMeta(0).data.forEach(function(objArc, intIndex)
				{
					var objPosition = objArc.tooltipPosition();
					var dblPercentage = dblTotal > 0 ? ((arrValues[intIndex] / dblTotal) * 100) : 0;

					//skip labels on slices too small to fit the text
					if (dblPercentage < MIN_PERCENT_LABEL)
					{
						return;
					}

					objContext.save();
					objContext.fillStyle = '#ffffff';
					objContext.font = '600 11px Inter, sans-serif';
					objContext.textAlign = 'center';
					objContext.textBaseline = 'middle';
					objContext.fillText(dblPercentage.toFixed(1) + '%', objPosition.x, objPosition.y);
					objContext.restore();
				});
			}
		};

		if (!elCanvas)
		{
			return;
		}

		destroyChart('plannedMeasure');
		charts.plannedMeasure = new Chart(elCanvas, {
			type: 'pie',
			data: {
				labels: objPlannedByMeasure.labels,
				datasets: [
					{
						label: 'Planned Quantity',
						data: objPlannedByMeasure.values,
						backgroundColor: buildBarColors(objPlannedByMeasure.labels.length)
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'right',
						labels: {
							boxWidth: 10,
							boxHeight: 10,
							padding: 12
						}
					},
					tooltip: {
						callbacks: {
							label: function(objContext)
							{
								var dblTotal = objContext.dataset.data.reduce(function(dblSum, numValue) { return dblSum + Number(numValue || 0); }, 0);
								var dblPercentage = dblTotal > 0 ? ((Number(objContext.raw) / dblTotal) * 100) : 0;

								return objContext.label + ' — Planned Quantity: ' + objContext.raw + ' (' + dblPercentage.toFixed(1) + '%)';
							}
						}
					}
				}
			},
			plugins: [objPercentageLabelsPlugin]
		});
	}

	//this function creates the particular breakdown chart for the selected measure
	function buildParticularChart()
	{
		var objBreakdown = sampleDashboardPhysical.particularBreakdown[state.particularMeasure];

		if (!objBreakdown)
		{
			return;
		}

		buildHorizontalBarChart('db-chart-particulars', 'particulars', 'Planned Quantity', objBreakdown.labels, objBreakdown.values, false, PASTEL_COLORS.mooe);
	}

	//this function creates the physical tab charts
	function buildPhysicalCharts()
	{
		var elPlannedAccomplishedCanvas = document.getElementById('db-chart-planned-accomplished');
		var objPlanned = sampleDashboardPhysical.plannedVsAccomplished;

		buildHorizontalBarChart('db-chart-projects-pillar', 'projectsPillar', 'Planned Projects', sampleDashboardPhysical.projectsByPillar.labels, sampleDashboardPhysical.projectsByPillar.values, false);
		buildPlannedMeasurePieChart();
		buildParticularChart();

		if (elPlannedAccomplishedCanvas)
		{
			destroyChart('plannedAccomplished');
			charts.plannedAccomplished = new Chart(elPlannedAccomplishedCanvas, {
				type: 'bar',
				data: {
					labels: objPlanned.labels,
					datasets: [
						{ label: 'Planned', data: objPlanned.planned, backgroundColor: PASTEL_COLORS.appropriation },
						{ label: 'Accomplished', data: objPlanned.accomplished, backgroundColor: PASTEL_COLORS.obligation }
					]
				},
				options: buildChartOptions(true)
			});
		}

		buildHorizontalBarChart('db-chart-achievement-pillar', 'achievementPillar', 'Achievement Rate', sampleDashboardPhysical.achievementRateByPillar.labels, sampleDashboardPhysical.achievementRateByPillar.values, true, PASTEL_COLORS.co);
	}

	/* -- Events -------------------------------------- */

	//this function refills agency name options for the selected category
	function populateAgencyNameOptions(strCategory, strSelectedAgency)
	{
		var elAgencyName = document.getElementById('db-filter-agency-name');
		var arrAgencies = sampleDashboardFilters.agencyNames;
		var strHtml = '<option value="">All Agencies</option>';

		if (!elAgencyName)
		{
			return;
		}

		arrAgencies.forEach(function(objAgency)
		{
			var blnMatchesCategory = (!strCategory) || (objAgency.category === strCategory);

			if (blnMatchesCategory === true)
			{
				strHtml += '<option value="' + escapeHtml(objAgency.value) + '">' + escapeHtml(objAgency.label) + '</option>';
			}
		});

		elAgencyName.innerHTML = strHtml;
		elAgencyName.value = strSelectedAgency || '';
	}

	//this function keeps agency category and agency name filters in sync
	function bindAgencyFilterSync()
	{
		var elAgencyCategory = document.getElementById('db-filter-agency-category');
		var elAgencyName = document.getElementById('db-filter-agency-name');

		if (!elAgencyCategory || !elAgencyName)
		{
			return;
		}

		//selecting a category narrows the agency list to that category
		elAgencyCategory.addEventListener('change', function()
		{
			populateAgencyNameOptions(elAgencyCategory.value, '');
		});

		//selecting an agency auto-selects its category
		elAgencyName.addEventListener('change', function()
		{
			var strAgency = elAgencyName.value;
			var objAgency = null;

			sampleDashboardFilters.agencyNames.forEach(function(objCandidate)
			{
				if (objCandidate.value === strAgency)
				{
					objAgency = objCandidate;
				}
			});

			if (objAgency)
			{
				elAgencyCategory.value = objAgency.category;
				populateAgencyNameOptions(objAgency.category, strAgency);
			}
		});
	}

	//this function wires tab, filter and table sort events after render
	function bindEvents()
	{
		bindAgencyFilterSync();

		elRoot.querySelectorAll('.dashboard-tabs__btn').forEach(function(elButton)
		{
			elButton.addEventListener('click', function()
			{
				state.activeTab = elButton.getAttribute('data-tab');
				renderPage();
			});
		});

		elRoot.querySelectorAll('.br-table__sortable[data-sort-key]').forEach(function(elHeader)
		{
			elHeader.addEventListener('click', function()
			{
				var strKey = elHeader.getAttribute('data-sort-key');

				if (state.sortKey === strKey)
				{
					state.sortDir = (state.sortDir === 'asc') ? 'desc' : 'asc';
				}
				else
				{
					state.sortKey = strKey;
					state.sortDir = 'asc';
				}

				renderPage();
			});
		});

		elRoot.querySelectorAll('.br-table__sortable[data-plan-sort-key]').forEach(function(elHeader)
		{
			elHeader.addEventListener('click', function()
			{
				var strKey = elHeader.getAttribute('data-plan-sort-key');

				if (state.planningSortKey === strKey)
				{
					state.planningSortDir = (state.planningSortDir === 'asc') ? 'desc' : 'asc';
				}
				else
				{
					state.planningSortKey = strKey;
					state.planningSortDir = 'asc';
				}

				renderPage();
			});
		});

		var elApply = document.getElementById('btn-db-apply');
		var elClear = document.getElementById('btn-db-clear');

		if (elApply)
		{
			//prototype only: filters do not re-query data yet
			elApply.addEventListener('click', function() { renderPage(); });
		}

		if (elClear)
		{
			elClear.addEventListener('click', function()
			{
				elRoot.querySelectorAll('.dashboard-filters select').forEach(function(elSelect)
				{
					elSelect.selectedIndex = 0;
				});
				populateAgencyNameOptions('', '');
			});
		}

		var elParticularMeasure = document.getElementById('db-particular-measure');

		if (elParticularMeasure)
		{
			//drill down into particulars of one selected measure only
			elParticularMeasure.addEventListener('change', function()
			{
				state.particularMeasure = elParticularMeasure.value;
				buildParticularChart();
			});
		}
	}

	/* -- Main render --------------------------------- */

	//this function renders the whole dashboard page
	function renderPage()
	{
		var strBody = '';

		if (state.activeTab === TAB_PLANNING)
		{
			strBody = renderPlanningTab();
		}
		else if (state.activeTab === TAB_PHYSICAL)
		{
			strBody = renderPhysicalTab();
		}
		else
		{
			strBody = renderMonitoringTab();
		}

		elRoot.innerHTML = '<div class="dashboard-page">' +
			'<div class="dashboard-page-header mb-3"><h1>Dashboard & Monitoring</h1></div>' +
			renderTabs() +
			'<div class="mt-3">' + renderFilters() + '</div>' +
			'<div class="dashboard-tab-section">' + strBody + '</div>' +
		'</div>';

		bindEvents();

		if (state.activeTab === TAB_PLANNING)
		{
			buildPlanningCharts();
		}
		else if (state.activeTab === TAB_PHYSICAL)
		{
			buildPhysicalCharts();
		}
		else
		{
			buildMonitoringCharts();
		}
	}

	renderPage();
}());
