/**
*System Name: Budget Management System
*Module Name: prototype_ui
*
*Purpose of this file:
*Shared prototype UI helpers — buttons, escapeHtml, formatCurrency, formatTimestamp.
*
*Author: none
*
*Copyright (C) 2026
*by the Department of Science and Technology - Central Office
*
*All rights reserved.
*/

(function (global)
{
	'use strict';

	function escapeHtml(strValue)
	{
		return String(strValue || '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function formatCurrency(numValue)
	{
		var dblAmount = Number(numValue) || 0;
		return '₱' + dblAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function formatTimestamp(strIso, strEmptyLabel)
	{
		if (!strIso)
		{
			return strEmptyLabel !== undefined ? strEmptyLabel : '-';
		}

		var dt = new Date(strIso);

		if (isNaN(dt.getTime()))
		{
			return strIso;
		}

		return dt.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
	}

	var SVG_TRASH = '<svg class="proto-icon proto-icon--trash" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">' +
		'<path fill="currentColor" d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>' +
		'<path fill="currentColor" fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>' +
		'</svg>';

	var SVG_PLUS = '<svg class="proto-icon proto-icon--plus" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">' +
		'<path fill="currentColor" d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>' +
		'</svg>';

	var SVG_CHECK = '<svg class="proto-icon proto-icon--check" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">' +
		'<path fill="currentColor" d="M13.485 3.515a.75.75 0 0 1 .01 1.06l-6.25 6.5a.75.75 0 0 1-1.08.02L2.515 8.485a.75.75 0 1 1 1.06-1.06l2.72 2.72 5.69-5.92a.75.75 0 0 1 1.06-.01z"/>' +
		'</svg>';

	var SVG_PENCIL = '<svg class="proto-icon proto-icon--pencil" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">' +
		'<path fill="currentColor" d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>' +
		'</svg>';

	function buildAttrs(objAttrs)
	{
		var strHtml = '';
		var strKey;

		if (!objAttrs)
		{
			return strHtml;
		}

		for (strKey in objAttrs)
		{
			if (!Object.prototype.hasOwnProperty.call(objAttrs, strKey))
			{
				continue;
			}

			if (objAttrs[strKey] === null || objAttrs[strKey] === undefined)
			{
				continue;
			}

			if (objAttrs[strKey] === '')
			{
				strHtml += ' ' + strKey;
				continue;
			}

			strHtml += ' ' + strKey + '="' + escapeHtml(objAttrs[strKey]) + '"';
		}

		return strHtml;
	}

	function renderOutlineSecondaryButton(strLabel, objAttrs)
	{
		objAttrs = objAttrs || {};
		var strClass = 'btn btn-outline-secondary proto-btn proto-btn--outline-secondary';

		if (objAttrs.className)
		{
			strClass += ' ' + objAttrs.className;
			delete objAttrs.className;
		}

		return '<button type="button" class="' + strClass + '"' + buildAttrs(objAttrs) + '>' + escapeHtml(strLabel) + '</button>';
	}

	function renderPrimaryButton(strLabel, objAttrs)
	{
		objAttrs = objAttrs || {};
		var strClass = 'btn btn-primary proto-btn proto-btn--primary';

		if (objAttrs.className)
		{
			strClass += ' ' + objAttrs.className;
			delete objAttrs.className;
		}

		return '<button type="button" class="' + strClass + '"' + buildAttrs(objAttrs) + '>' + escapeHtml(strLabel) + '</button>';
	}

	function renderAddButton(strLabel, objAttrs)
	{
		return renderOutlineSecondaryButton(strLabel, objAttrs);
	}

	function renderTrashButton(strAriaLabel, objAttrs)
	{
		objAttrs = objAttrs || {};
		var strClass = 'btn btn-sm btn-icon-danger proto-btn proto-btn--trash';

		if (objAttrs.className)
		{
			strClass += ' ' + objAttrs.className;
			delete objAttrs.className;
		}

		if (!objAttrs.title)
		{
			objAttrs.title = strAriaLabel;
		}

		if (!objAttrs['aria-label'])
		{
			objAttrs['aria-label'] = strAriaLabel;
		}

		return '<button type="button" class="' + strClass + '"' + buildAttrs(objAttrs) + '>' + SVG_TRASH + '</button>';
	}

	function renderSecondaryButton(strLabel, objAttrs)
	{
		return renderOutlineSecondaryButton(strLabel, objAttrs);
	}

	function renderEditButton(strAriaLabel, objAttrs)
	{
		objAttrs = objAttrs || {};
		var strClass = 'btn btn-sm btn-icon-edit proto-btn proto-btn--edit';

		if (objAttrs.className)
		{
			strClass += ' ' + objAttrs.className;
			delete objAttrs.className;
		}

		if (!objAttrs.title)
		{
			objAttrs.title = strAriaLabel;
		}

		if (!objAttrs['aria-label'])
		{
			objAttrs['aria-label'] = strAriaLabel;
		}

		return '<button type="button" class="' + strClass + '"' + buildAttrs(objAttrs) + '>' + SVG_PENCIL + '</button>';
	}

	global.PrototypeUi = {
		escapeHtml: escapeHtml,
		formatCurrency: formatCurrency,
		formatTimestamp: formatTimestamp,
		renderOutlineSecondaryButton: renderOutlineSecondaryButton,
		renderPrimaryButton: renderPrimaryButton,
		renderAddButton: renderAddButton,
		renderTrashButton: renderTrashButton,
		renderSecondaryButton: renderSecondaryButton,
		renderEditButton: renderEditButton,
		SVG_TRASH: SVG_TRASH,
		SVG_PLUS: SVG_PLUS,
		SVG_CHECK: SVG_CHECK,
		SVG_PENCIL: SVG_PENCIL
	};
}(typeof window !== 'undefined' ? window : this));
