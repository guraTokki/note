
import pandas as pd

import get_finance_data

def run(issues, dirName):
    fin_data = []
    for issue in issues:
        sym = issue['symbolCode'][1:]
        col_names1, fin_data1 = get_finance_data.get_finance_data(sym, dirName)
        if len(col_names1) > 0:
            col_names = col_names1
            fin_data.append([sym] + fin_data1)

    # df = pd.DataFrame(fin_data, index=col_names)

    # print(['code'] + col_names)
    # print(fin_data)

    df = pd.DataFrame(fin_data, columns=['code'] + col_names)

    print(df)
    df.to_csv('fin_data.csv')

# 
# 사업가치 = 영영이익3년평균 
# 재산가치 = 유동자산 + 고정자산중투자자산 - 1.2*유동부채 - 비유동부채 
# 1주당 가치 = (사업가치 + 재산가치)/총주식수
#
# 여기서는 고정자산중투자자산 = 투자자산 + 투자부동산 로 계산

def run2 (issues, dirName, dirData):

    col_names1 = ['영업이익', '법인세비용차감전계속사업이익', '매출액(수익)']
    col_names2 = ['유동자산','단기금융자산', '현금및현금성자산', '매출채권및기타채권', '비유동자산', '투자부동산', '투자자산', '유동부채', '비유동부채', '발행주식수']
    col_names = col_names1 + col_names2

    fin_data = []

    for issue in issues:
        sym = issue['symbolCode'][1:]
        t1,t2 = get_finance_data.get_raw_table(sym, dirData)
        print(sym, t1 == None)
        if t1 == None:
            continue
        rows1 = get_finance_data.get_row_indice(t1, col_names1)
        rows2 = get_finance_data.get_row_indice(t2, col_names2)

        fin_data1 = get_finance_data.get_finance_data2(t1,rows1, t2, rows2)
        col1 =[issue['name'], issue['marketCap'], issue['sectorCode'], issue['sectorName']]
        fin_data.append([sym] + col1 + fin_data1)
        print(type(fin_data1))

    col1_names = ['종목명', '시가총액', '섹터코드', '섹터명' ]
    df = pd.DataFrame(fin_data, columns=['code'] + col1_names + col_names)
    
    #print('영업이익 type:', type(df['영업이익'][0]))
    #print(fin_data)
    #print(issues)
    
    df.to_csv(dirName+'/fin_data.csv')


