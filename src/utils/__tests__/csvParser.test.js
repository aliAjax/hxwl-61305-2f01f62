import { describe, it, expect } from 'vitest';
import { parseCsvLine, parseCsv, requiredCsvColumns, csvColumnMap } from '../csvParser';

describe('parseCsvLine', () => {
  it('应正确解析简单的CSV行', () => {
    const result = parseCsvLine('a,b,c');
    expect(result.values).toEqual(['a', 'b', 'c']);
    expect(result.hasUnclosedQuote).toBe(false);
  });

  it('应正确解析带空格的字段并去除首尾空格', () => {
    const result = parseCsvLine('  a  ,  b  ,  c  ');
    expect(result.values).toEqual(['a', 'b', 'c']);
  });

  it('应正确解析带引号的字段', () => {
    const result = parseCsvLine('"hello, world",b,c');
    expect(result.values).toEqual(['hello, world', 'b', 'c']);
    expect(result.hasUnclosedQuote).toBe(false);
  });

  it('应正确解析带转义双引号的字段', () => {
    const result = parseCsvLine('"he said ""hello""",b,c');
    expect(result.values).toEqual(['he said "hello"', 'b', 'c']);
  });

  it('应检测未闭合的引号', () => {
    const result = parseCsvLine('"unclosed quote,b,c');
    expect(result.hasUnclosedQuote).toBe(true);
    expect(result.values.length).toBeGreaterThan(0);
  });

  it('空行应返回一个空字段', () => {
    const result = parseCsvLine('');
    expect(result.values).toEqual(['']);
    expect(result.hasUnclosedQuote).toBe(false);
  });

  it('单个字段应正确解析', () => {
    const result = parseCsvLine('single');
    expect(result.values).toEqual(['single']);
  });

  it('首尾的逗号应产生空字段', () => {
    const result = parseCsvLine(',a,');
    expect(result.values).toEqual(['', 'a', '']);
  });
});

describe('parseCsv - 标准CSV解析', () => {
  it('应正确解析标准CSV数据', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
蓝海家居,618门店促销,2026-06-13,08:00-09:00,4,3600
北城眼镜,暑期配镜,2026-06-13,18:00-19:00,3,2800`;

    const result = parseCsv(csv);

    expect(result.headers).toEqual(['客户', '广告名称', '投放日期', '时段', '播放次数', '合同金额']);
    expect(result.missingHeaders).toEqual([]);
    expect(result.rows.length).toBe(2);
    expect(result.rows[0].client).toBe('蓝海家居');
    expect(result.rows[0].adName).toBe('618门店促销');
    expect(result.rows[0].date).toBe('2026-06-13');
    expect(result.rows[0].slot).toBe('08:00-09:00');
    expect(result.rows[0].plays).toBe('4');
    expect(result.rows[0].amount).toBe('3600');
    expect(result.lineErrors.length).toBe(0);
    expect(result.parseErrors.length).toBe(0);
  });

  it('应支持Windows换行符(\\r\\n)', () => {
    const csv = '客户,广告名称,投放日期,时段,播放次数,合同金额\r\nA公司,广告1,2026-01-01,08:00-09:00,2,1000';
    const result = parseCsv(csv);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].client).toBe('A公司');
  });

  it('应正确映射中文列名到英文key', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
测试客户,测试广告,2026-01-01,08:00-09:00,1,100`;

    const result = parseCsv(csv);
    const row = result.rows[0];

    expect(row.client).toBe('测试客户');
    expect(row.adName).toBe('测试广告');
    expect(row.date).toBe('2026-01-01');
    expect(row.slot).toBe('08:00-09:00');
    expect(row.plays).toBe('1');
    expect(row.amount).toBe('100');
  });

  it('带引号的字段中包含逗号应正确解析', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
"蓝海,家居",618促销,2026-06-13,08:00-09:00,4,3600`;

    const result = parseCsv(csv);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].client).toBe('蓝海,家居');
    expect(result.lineErrors.length).toBe(0);
  });
});

describe('parseCsv - 中文逗号检测', () => {
  it('应检测到中文逗号并产生警告', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
蓝海家居，618促销，2026-06-13，08:00-09:00，4，3600`;

    const result = parseCsv(csv);
    expect(result.chineseCommaWarnings.length).toBeGreaterThan(0);
    expect(result.chineseCommaWarnings[0].rowIndex).toBe(2);
    expect(result.chineseCommaWarnings[0].message).toContain('中文逗号');
  });

  it('没有中文逗号时警告列表为空', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
蓝海家居,618促销,2026-06-13,08:00-09:00,4,3600`;

    const result = parseCsv(csv);
    expect(result.chineseCommaWarnings.length).toBe(0);
  });

  it('中文逗号警告中应包含行号和预览内容', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
蓝海家居，618促销，2026-06-13，08:00-09:00，4，3600`;

    const result = parseCsv(csv);
    const warning = result.chineseCommaWarnings[0];
    expect(warning.rowIndex).toBeDefined();
    expect(warning.message).toBeDefined();
    expect(warning.preview).toBeDefined();
  });
});

describe('parseCsv - 引号未闭合', () => {
  it('应检测到引号未闭合并记录行错误', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
"未闭合引号,广告1,2026-01-01,08:00-09:00,2,1000
正常客户,正常广告,2026-01-02,08:00-09:00,3,2000`;

    const result = parseCsv(csv);
    expect(result.lineErrors.length).toBe(1);
    expect(result.lineErrors[0].rowIndex).toBe(2);
    expect(result.lineErrors[0].errors[0]).toContain('引号未闭合');
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].client).toBe('正常客户');
  });

  it('多行引号未闭合都应被检测到', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
"坏行1,广告1,2026-01-01,08:00-09:00,2,1000
"坏行2,广告2,2026-01-02,08:00-09:00,3,2000
好客户,好广告,2026-01-03,08:00-09:00,1,500`;

    const result = parseCsv(csv);
    expect(result.lineErrors.length).toBe(2);
    expect(result.rows.length).toBe(1);
  });

  it('正确闭合的引号不应报错', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
"正确闭合",广告1,2026-01-01,08:00-09:00,2,1000`;

    const result = parseCsv(csv);
    expect(result.lineErrors.length).toBe(0);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].client).toBe('正确闭合');
  });
});

describe('parseCsv - 字段数量不一致', () => {
  it('字段数量不足时应产生解析错误', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
客户A,广告A,2026-01-01,08:00-09:00,2`;

    const result = parseCsv(csv);
    expect(result.parseErrors.length).toBe(1);
    expect(result.parseErrors[0].errors[0]).toContain('字段数量不足');
    expect(result.rows[0]._errors.some(e => e.includes('字段数量'))).toBe(true);
    expect(result.rows[0]._hasParseError).toBe(true);
  });

  it('字段数量过多时应产生解析错误', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
客户A,广告A,2026-01-01,08:00-09:00,2,1000,额外字段`;

    const result = parseCsv(csv);
    expect(result.parseErrors.length).toBe(1);
    expect(result.parseErrors[0].errors[0]).toContain('字段数量过多');
    expect(result.rows[0]._hasParseError).toBe(true);
  });

  it('字段数量正确的行不应有解析错误', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
客户A,广告A,2026-01-01,08:00-09:00,2,1000`;

    const result = parseCsv(csv);
    expect(result.rows[0]._errors.some(e => e.includes('字段数量'))).toBe(false);
  });
});

describe('parseCsv - 缺少必填列', () => {
  it('应检测到缺少的必填列头', () => {
    const csv = `客户,广告名称,投放日期
客户A,广告A,2026-01-01`;

    const result = parseCsv(csv);
    expect(result.missingHeaders.length).toBeGreaterThan(0);
    expect(result.missingHeaders).toContain('时段');
    expect(result.missingHeaders).toContain('播放次数');
    expect(result.missingHeaders).toContain('合同金额');
  });

  it('所有必填列都存在时missingHeaders应为空', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
客户A,广告A,2026-01-01,08:00-09:00,2,1000`;

    const result = parseCsv(csv);
    expect(result.missingHeaders).toEqual([]);
  });

  it('行数据中缺少必填字段值应标记为缺少必需字段', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
客户A,,2026-01-01,08:00-09:00,2,1000`;

    const result = parseCsv(csv);
    expect(result.rows[0]._missingFields).toContain('广告名称');
    expect(result.rows[0]._errors.some(e => e.includes('缺少必需字段'))).toBe(true);
  });

  it('完全缺少列头时应返回所有必填列为缺失', () => {
    const csv = '随便一列\n随便一个值';

    const result = parseCsv(csv);
    expect(result.missingHeaders.length).toBe(requiredCsvColumns.length);
  });
});

describe('parseCsv - 空行跳过', () => {
  it('应跳过空行并记录空行号', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额

客户A,广告A,2026-01-01,08:00-09:00,2,1000

客户B,广告B,2026-01-02,08:00-09:00,3,2000`;

    const result = parseCsv(csv);
    expect(result.rows.length).toBe(2);
    expect(result.emptyLines).toEqual([2, 4]);
  });

  it('只包含空格的行也应被视为空行', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
    
客户A,广告A,2026-01-01,08:00-09:00,2,1000`;

    const result = parseCsv(csv);
    expect(result.emptyLines.length).toBe(1);
    expect(result.rows.length).toBe(1);
  });

  it('首尾的空行也应被记录', () => {
    const csv = `

客户,广告名称,投放日期,时段,播放次数,合同金额
客户A,广告A,2026-01-01,08:00-09:00,2,1000
`;

    const result = parseCsv(csv);
    expect(result.emptyLines.length).toBeGreaterThan(0);
    expect(result.rows.length).toBe(1);
  });
});

describe('parseCsv - 边界情况', () => {
  it('空字符串输入应返回空结果', () => {
    const result = parseCsv('');
    expect(result.rows).toEqual([]);
    expect(result.headers).toEqual([]);
    expect(result.missingHeaders).toEqual(requiredCsvColumns);
  });

  it('只有表头没有数据行应返回空行数组', () => {
    const csv = '客户,广告名称,投放日期,时段,播放次数,合同金额';
    const result = parseCsv(csv);
    expect(result.headers.length).toBe(6);
    expect(result.rows.length).toBe(0);
  });

  it('只有表头和空行应正确处理', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额

`;
    const result = parseCsv(csv);
    expect(result.rows.length).toBe(0);
    expect(result.emptyLines.length).toBeGreaterThan(0);
  });

  it('行号应正确对应原始行号', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额

第一行数据,广告1,2026-01-01,08:00-09:00,2,1000

第二行数据,广告2,2026-01-02,08:00-09:00,3,2000`;

    const result = parseCsv(csv);
    expect(result.rows[0]._rowIndex).toBe(3);
    expect(result.rows[1]._rowIndex).toBe(5);
  });

  it('列名映射应与常量一致', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
测试,测试广告,2026-01-01,08:00-09:00,1,100`;

    const result = parseCsv(csv);
    const row = result.rows[0];

    expect(row[csvColumnMap['客户']]).toBe('测试');
    expect(row[csvColumnMap['广告名称']]).toBe('测试广告');
    expect(row[csvColumnMap['投放日期']]).toBe('2026-01-01');
    expect(row[csvColumnMap['时段']]).toBe('08:00-09:00');
    expect(row[csvColumnMap['播放次数']]).toBe('1');
    expect(row[csvColumnMap['合同金额']]).toBe('100');
  });

  it('附加列（非必填列）应被忽略但不报错', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额,备注
测试客户,测试广告,2026-01-01,08:00-09:00,1,100,测试备注`;

    const result = parseCsv(csv);
    expect(result.headers.length).toBe(7);
    expect(result.missingHeaders).toEqual([]);
    expect(result.rows[0]._hasParseError).toBe(false);
  });
});

describe('parseCsv - 综合场景', () => {
  it('复杂CSV：混合正常行、空行、中文逗号、引号未闭合、字段数量错误', () => {
    const csv = `客户,广告名称,投放日期,时段,播放次数,合同金额
正常客户,正常广告,2026-06-13,08:00-09:00,4,3600

中文逗号行，广告名，2026-06-13，08:00-09:00，3，2800
"未闭合引号,广告名,2026-06-13,08:00-09:00,2,1600
字段少,广告名,2026-06-13,08:00-09:00
字段多,广告名,2026-06-13,08:00-09:00,5,5000,多余字段
另一个正常行,另一个广告,2026-06-14,12:00-13:00,2,8000`;

    const result = parseCsv(csv);

    expect(result.rows.length).toBe(5);
    expect(result.emptyLines.length).toBe(1);
    expect(result.lineErrors.length).toBe(1);
    expect(result.chineseCommaWarnings.length).toBe(1);
    expect(result.parseErrors.length).toBeGreaterThanOrEqual(2);

    expect(result.rows[0].client).toBe('正常客户');
    expect(result.rows[0]._hasParseError).toBe(false);

    expect(result.rows[result.rows.length - 1].client).toBe('另一个正常行');
    expect(result.rows[result.rows.length - 1]._hasParseError).toBe(false);
  });
});
