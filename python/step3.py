import pandas as pd

def run(issues):
    df = pd.read_csv('fin_data.csv')
    # print(df)
    sum_profit = 0
    profits = eval(df['영업이익'][0])
    count = len(profits)
    print(count)
    # print(count, profits, eval(profits), type(eval(profits)))

    avg_profits = []
    for str_profits in df['영업이익']:
        profits = eval(str_profits)
        count = 0
        sum_profit = 0
        for profit in profits:
            if len(profit)>0:
                val = float(profit.replace(',',''))
                # print('변환', profit, ' -> ', val)
                sum_profit += val
                count += 1

        avg_profit = count>0 and sum_profit/count or 0
        avg_profits.append(avg_profit)

    # print(avg_profits)
    def _get(name):
        arr =[]
        for it in df[name]:
            # print('it : ', it)
            item = eval(it)
            # print('item : ', type(item), item, item[len(item)-1])
            arr.append(item[len(item)-1])
        return arr

    df['평균영업이익'] = avg_profits
    df['최근_유동자산'] = _get('유동자산')
    df['최근_투자부동산'] = _get('투자부동산')

    # df['최근_비유동자산'] = [item[len(item)-1] for item in df['비유동자산']]

    df['최근_투자자산'] = _get('투자자산')

    df['최근_유동부채'] = _get('유동부채')
    df['최근_비유동부채'] = _get('비유동부채')
    df['최근_발행주식수'] = _get('발행주식수')

    get_all_quote(issues,df)
    print(df)
    df.to_csv('fin_data2.csv')    

def run2(dirName):
    df = pd.read_csv(dirName+'/fin_data.csv')
    # print(df)
    sum_profit = 0
    profits = eval(df['영업이익'][0])
    count = len(profits)
    #print(count)
    # print(count, profits, eval(profits), type(eval(profits)))

    avg_profits = []
    for str_profits in df['영업이익']:
        profits = eval(str_profits)
        count = 0
        sum_profit = 0
        for profit in profits:
            if len(profit)>0:
                val = float(profit.replace(',',''))
                # print('변환', profit, ' -> ', val)
                sum_profit += val
                count += 1

        avg_profit = count>0 and sum_profit/count or 0
        avg_profits.append(avg_profit)

    # print(avg_profits)
    def _get(name):
        arr =[]
        for it in df[name]:
            # print('it : ', it)
            item = eval(it)
            # print('item : ', type(item), item, item[len(item)-1])
            arr.append(item[len(item)-1])
        return arr

    df['평균영업이익'] = avg_profits
    df['법인세비용차감전계속사업이익'] = _get('법인세비용차감전계속사업이익')
    df['최근_유동자산'] = _get('유동자산')
    df['최근_투자부동산'] = _get('투자부동산')

    # df['최근_비유동자산'] = [item[len(item)-1] for item in df['비유동자산']]

    df['최근_투자자산'] = _get('투자자산')

    df['최근_유동부채'] = _get('유동부채')
    df['최근_비유동부채'] = _get('비유동부채')
    df['최근_발행주식수'] = _get('발행주식수')

    #get_all_quote(issues,df)
    print(df)
    df.to_csv(dirName + '/fin_data2.csv')    


def get_all_quote(issues, df):

    col1 = []
    col2 = []
    col3 = []
    col4 = []

    for code in df['code']:
        jcd = ("%6d"%code).replace(' ', '0')
        find = 0
        pre_cd = ''
        pre_sym = ''
        pre_jcd = ''
        pre_sector = ''
        for issue in issues:    
            sym = issue['symbolCode'][1:]
            # print(type(code), type(sym), jcd)
            if jcd == sym:
                col1.append(issue['name'])
                col2.append(issue['marketCap'])
                col3.append(issue['sectorCode'])
                col4.append(issue['sectorName'])
                break
                find += 1
                if find == 1:
                    pre_cd = code
                    pre_sym = sym
                    pre_jcd = jcd
                    pre_sector = issue['sectorName']
                if find > 1:
                    print('pre', pre_cd, pre_jcd, pre_sym, pre_sector)
                    print('cur', code, jcd, sym, issue['sectorName'])
        # issue = {'name': stock['name'], 'code': stock['code'], 'symbolCode': stock['symbolCode'], stock['marketCap'], 'sectorCode':sector['sectorCode'], 'sectorName': sector['sectorName']}
    # print(col1)

    print('len col1', len(col1), len(df['code']))
    df['종목명'] = col1
    df['시가총액'] = col2
    df['섹터코드'] = col3
    df['섹터명'] = col4
