const csvColumnMap = {
  '客户': 'client',
  '广告名称': 'adName',
  '投放日期': 'date',
  '时段': 'slot',
  '播放次数': 'plays',
  '合同金额': 'amount',
};

const requiredCsvColumns = ['客户', '广告名称', '投放日期', '时段', '播放次数', '合同金额'];

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        current += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
  }

  result.push(current.trim());
  return { values: result, hasUnclosedQuote: inQuotes };
}

function parseCsv(text) {
  const rawLines = text.split(/\r?\n/);
  const lines = [];
  const lineErrors = [];
  const chineseCommaWarnings = [];
  const emptyLines = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const displayLineNo = i + 1;

    if (!line.trim()) {
      emptyLines.push(displayLineNo);
      continue;
    }

    if (line.includes('，')) {
      chineseCommaWarnings.push({
        rowIndex: displayLineNo,
        message: `第${displayLineNo}行检测到中文逗号"，"，请改为英文逗号","`,
        preview: line.length > 40 ? line.slice(0, 40) + '...' : line,
      });
    }

    const { values, hasUnclosedQuote } = parseCsvLine(line);

    if (hasUnclosedQuote) {
      lineErrors.push({
        rowIndex: displayLineNo,
        errors: ['引号未闭合，该行无法正确解析'],
        rawLine: line,
      });
      continue;
    }

    lines.push({ values, rawLineNo: displayLineNo, rawLine: line });
  }

  if (lines.length < 1) {
    return {
      rows: [],
      headers: [],
      missingHeaders: requiredCsvColumns,
      lineErrors,
      chineseCommaWarnings,
      parseErrors: [],
      emptyLines,
    };
  }

  const headers = lines[0].values.map((h) => h.trim());
  const missingHeaders = requiredCsvColumns.filter((h) => !headers.includes(h));
  const headerColumnCount = headers.length;

  const rows = [];
  const parseErrors = [];

  for (let i = 1; i < lines.length; i++) {
    const { values, rawLineNo, rawLine } = lines[i];
    const rowErrors = [];
    const row = {};

    if (values.length !== headerColumnCount) {
      if (values.length < headerColumnCount) {
        rowErrors.push(`字段数量不足：期望${headerColumnCount}列，实际${values.length}列`);
      } else {
        rowErrors.push(`字段数量过多：期望${headerColumnCount}列，实际${values.length}列`);
      }
    }

    headers.forEach((header, idx) => {
      const key = csvColumnMap[header];
      if (key) row[key] = values[idx] || '';
    });

    const missingFields = requiredCsvColumns
      .filter((h) => !headers.includes(h) || !row[csvColumnMap[h]])
      .map((h) => h);

    if (missingFields.length > 0) {
      rowErrors.push(`缺少必需字段：${missingFields.join('、')}`);
    }

    const hasParseError = rowErrors.some((e) =>
      e.includes('字段数量') || e.includes('引号未闭合')
    );

    rows.push({
      ...row,
      _rowIndex: rawLineNo,
      _missingFields: missingFields,
      _errors: rowErrors,
      _hasParseError: hasParseError,
      _rawLine: rawLine,
    });

    if (hasParseError || missingFields.length === headers.length) {
      parseErrors.push({
        rowIndex: rawLineNo,
        errors: rowErrors,
        rawLine,
      });
    }
  }

  return {
    rows,
    headers,
    missingHeaders,
    lineErrors,
    chineseCommaWarnings,
    parseErrors,
    emptyLines,
  };
}

export {
  csvColumnMap,
  requiredCsvColumns,
  parseCsvLine,
  parseCsv,
};
