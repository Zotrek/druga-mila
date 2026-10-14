/**
 * Ten sam blok, który karta na mapie drugiej mili kopiuje do schowka.
 * Przy `npm run generate` idzie w log, bo karty wtedy nie ma.
 */

export interface DrugaMilaErrorReport {
  code: string;
  place: string;
  summary: string;
  effect: string;
  technical: string;
}

export interface DrugaMilaErrorLogger {
  error?: (message: string, ...args: unknown[]) => void;
  warn?: (message: string, ...args: unknown[]) => void;
  info?: (message: string, ...args: unknown[]) => void;
}

function oneLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function formatDrugaMilaError(report: DrugaMilaErrorReport): string {
  return [
    'DRUGA-MILA-ERROR',
    `kod: ${oneLine(report.code) || 'DM-E-UNKNOWN'}`,
    `miejsce: ${oneLine(report.place) || 'nieznane miejsce'}`,
    `objaw: ${oneLine(report.summary) || 'Coś się nie udało.'}`,
    `skutek: ${oneLine(report.effect) || 'Część danych może być niekompletna.'}`,
    `technicznie: ${oneLine(report.technical) || 'brak szczegółu'}`,
  ].join('\n');
}

export function logDrugaMilaError(
  logger: DrugaMilaErrorLogger | undefined,
  report: DrugaMilaErrorReport,
): void {
  const text = formatDrugaMilaError(report);
  const log = logger?.error ?? logger?.warn ?? logger?.info;
  if (log) {
    log(text);
    return;
  }
  console.error(text);
}

/** Style karty w wygenerowanym HTML. */
export const DM_ERROR_CARD_CSS = `
    .dm-error-stack {
      position: fixed; z-index: 32000; top: 12px; left: 50%; transform: translateX(-50%);
      width: min(440px, calc(100vw - 24px)); max-height: calc(100vh - 24px); overflow: auto;
      display: flex; flex-direction: column; gap: 8px; pointer-events: none;
    }
    .dm-error-stack[hidden] { display: none !important; }
    .dm-error-card {
      pointer-events: auto; padding: 14px 16px; border-radius: 12px;
      background: rgba(255,255,255,0.97); border: 1px solid rgba(176,42,55,0.4);
      box-shadow: 0 10px 28px rgba(15,23,42,0.18); color: #1e293b; text-align: left;
    }
    .dm-error-card-title { margin: 0 0 6px; font-size: 14px; font-weight: 700; line-height: 1.35; color: #b02a37; }
    .dm-error-card-effect { margin: 0 0 6px; font-size: 13.5px; font-weight: 500; line-height: 1.45; color: #1e293b; }
    .dm-error-card-continue { margin: 0 0 10px; font-size: 13.5px; font-weight: 600; line-height: 1.45; color: #1e293b; }
    .dm-error-card-label { display: block; margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.02em; color: #64748b; }
    .dm-error-card-report {
      width: 100%; box-sizing: border-box; margin: 0 0 10px; padding: 8px 10px; min-height: 7.2em;
      border-radius: 8px; border: 1px solid rgba(148,163,184,0.55); background: #f8fafc; color: #334155;
      font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; resize: vertical;
    }
    .dm-error-card-actions { display: flex; justify-content: space-between; gap: 8px; }
    .dm-error-card-actions button {
      margin: 0; padding: 6px 12px; border-radius: 8px; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer;
    }
    .dm-error-card-copy { border: 1px solid rgba(15,118,110,0.45); background: #fff; color: #0f766e; }
    .dm-error-card-dismiss { border: 1px solid rgba(176,42,55,0.35); background: #fff; color: #b02a37; }
`;

/**
 * Funkcje karty wklejane do mapy. Muszą składać ten sam blok co formatDrugaMilaError.
 */
export const DM_ERROR_CARD_SCRIPT = `
    function dmErrorOneLine_(value) {
      return String(value == null ? '' : value).replace(/\\s+/g, ' ').trim();
    }
    function dmErrorReportText(report) {
      var code = dmErrorOneLine_(report && report.code) || 'DM-E-UNKNOWN';
      var place = dmErrorOneLine_(report && report.place) || 'nieznane miejsce';
      var summary = dmErrorOneLine_(report && report.summary) || 'Coś się nie udało.';
      var effect = dmErrorOneLine_(report && report.effect) || 'Część danych może być niekompletna.';
      var technical = dmErrorOneLine_(report && report.technical) || 'brak szczegółu';
      return [
        'DRUGA-MILA-ERROR',
        'kod: ' + code,
        'miejsce: ' + place,
        'objaw: ' + summary,
        'skutek: ' + effect,
        'technicznie: ' + technical
      ].join('\\n');
    }
    /** Karta błędu u góry mapy. Nie blokuje kliknięć w mapę. Znika po Zamknij. */
    function showDmErrorCard(report) {
      var summary = dmErrorOneLine_(report && report.summary) || 'Coś się nie udało.';
      var effect = dmErrorOneLine_(report && report.effect) || 'Część danych może być niekompletna.';
      var reportText = dmErrorReportText(report);
      var code = dmErrorOneLine_(report && report.code) || 'DM-E-UNKNOWN';
      var stack = document.getElementById('dm-error-stack');
      if (!stack) {
        window.alert(summary + '\\n' + effect + '\\nMożesz dalej pracować na mapie.\\n\\n' + reportText);
        return;
      }
      var card = document.createElement('article');
      card.className = 'dm-error-card';
      card.setAttribute('data-dm-code', code);
      var title = document.createElement('h2');
      title.className = 'dm-error-card-title';
      title.textContent = summary;
      var effectEl = document.createElement('p');
      effectEl.className = 'dm-error-card-effect';
      effectEl.textContent = effect;
      var continueEl = document.createElement('p');
      continueEl.className = 'dm-error-card-continue';
      continueEl.textContent = 'Możesz dalej pracować na mapie.';
      var label = document.createElement('label');
      label.className = 'dm-error-card-label';
      label.textContent = 'Raport do wklejenia w czacie';
      var field = document.createElement('textarea');
      field.className = 'dm-error-card-report';
      field.readOnly = true;
      field.spellcheck = false;
      field.rows = 6;
      field.value = reportText;
      label.appendChild(field);
      var actions = document.createElement('div');
      actions.className = 'dm-error-card-actions';
      var copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'dm-error-card-copy';
      copyBtn.textContent = 'Kopiuj raport';
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'dm-error-card-dismiss';
      closeBtn.textContent = 'Zamknij';
      function markCopy(ok) {
        copyBtn.textContent = ok ? 'Skopiowano' : 'Zaznaczono — skopiuj ręcznie';
      }
      copyBtn.addEventListener('click', function () {
        field.focus();
        field.select();
        var text = field.value || '';
        var copied = false;
        try { copied = document.execCommand('copy'); } catch (e) { copied = false; }
        if (copied) {
          markCopy(true);
          return;
        }
        var clipboard = navigator.clipboard;
        if (clipboard && clipboard.writeText) {
          clipboard.writeText(text).then(function () { markCopy(true); }).catch(function () { markCopy(false); });
          return;
        }
        markCopy(false);
      });
      closeBtn.addEventListener('click', function () {
        if (card.parentNode) card.parentNode.removeChild(card);
        if (!stack.querySelector('.dm-error-card')) stack.hidden = true;
      });
      actions.appendChild(copyBtn);
      actions.appendChild(closeBtn);
      card.appendChild(title);
      card.appendChild(effectEl);
      card.appendChild(continueEl);
      card.appendChild(label);
      card.appendChild(actions);
      stack.appendChild(card);
      stack.hidden = false;
    }
    function dmHtmlSnippet_(body) {
      var raw = String(body || '');
      var title = '';
      var titleMatch = raw.match(/<title[^>]*>([\\s\\S]*?)<\\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim();
      }
      var text = raw
        .replace(new RegExp('<script[\\\\s\\\\S]*?<' + '/script>', 'gi'), ' ')
        .replace(new RegExp('<style[\\\\s\\\\S]*?<' + '/style>', 'gi'), ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\\s+/g, ' ')
        .trim();
      if (title && text.indexOf(title) === -1) text = (title + ' — ' + text).trim();
      if (text.length > 280) text = text.slice(0, 280);
      return text;
    }
    function readDmJson_(res) {
      return res.text().then(function (text) {
        var body = String(text == null ? '' : text);
        if (body.charCodeAt(0) === 0xFEFF) body = body.slice(1);
        body = body.trim();
        if (res.status === 401) {
          return { ok: false, error: 'unauthorized', status: 401 };
        }
        var first = body.charAt(0);
        if (first === '{' || first === '[') {
          try { return JSON.parse(body); } catch (eParse) {}
        }
        var snippet = dmHtmlSnippet_(body);
        return {
          ok: false,
          error: 'not_json',
          notJson: true,
          status: res.status,
          technical: 'HTTP ' + res.status + (snippet ? ': ' + snippet : '')
        };
      });
    }
    function dmApiErrorCard_(report, resp, err) {
      if ((resp && resp.status === 401) || (err && err.status === 401)) return;
      if ((resp && resp.error === 'proxy_auth_mismatch') || (err && err.apiError === 'proxy_auth_mismatch')) return;
      var notJson = !!((resp && resp.notJson) || (err && err.notJson));
      var technical = report && report.technical;
      if (notJson) {
        technical = String((resp && resp.technical) || (err && err.technical) || (err && err.message) || 'nie-JSON');
      } else if (!technical) {
        technical = String((resp && resp.error) || (err && err.message) || err || 'brak szczegółu');
      }
      showDmErrorCard({
        code: notJson ? 'DM-E-NOT-JSON' : (report && report.code),
        summary: report && report.summary,
        effect: report && report.effect,
        place: report && report.place,
        technical: technical
      });
    }
`;
