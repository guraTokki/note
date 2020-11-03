# To add a new cell, type '# %%'
# To add a new markdown cell, type '# %% [markdown]'

# %%
import requests
from bs4 import BeautifulSoup

url = 'http://comp.fnguide.com/SVO2/ASP/SVD_Main.asp?pGB=1&gicode=A086450&cID=&MenuYn=Y&ReportGB=&NewMenuID=101&stkGb=701'

res = requests.get(url)
html = res.text
soup = BeautifulSoup(html, 'html.parser')
tables = soup.select("#highlight_D_Y table")
#print(tables[0])


# %%
headers = tables[0].select("tr")
cols = []
for col in headers[1].select("th"):
    if col.a != None:
        cols.append(col.a.text)
    else:
        cols.append(col.text)
#print(cols)


# %%

data = []
for row in tables[0].tbody.select("tr"):
    rdata = []
    if row.th.a != None:
        rdata.append(row.th.a.text.strip('\xa0'))
    else:
        rdata.append(row.th.text.strip('\xa0'))

    for cell in row.select("td"):
        v = cell.text.replace(',','')
        rdata.append(v)
    data.append(rdata)
print(data[1])


# %%
def transepose(oldTable):
    newTable = []
    for h in range(len(oldTable[0])):
        nrow = []
        for v in range(len(oldTable)):
            #newTable[h][v] = oldTable[v][h]
            nrow.append(oldTable[v][h])
        newTable.append(nrow)
    return newTable


# %%
ndata = []
ndata.append(['year']+cols)
ndata = ndata + data
#print(ndata)
tdata = transepose(ndata)


# %%
import pandas as pd
df = pd.DataFrame(tdata[1:], columns=tdata[0])
display(df)


# %%

selected = df[df['year'] == '2020/12(E)']
print('roe', float(selected['ROE']))
print(str(selected['유보율']).isnumeric(), str(selected['유보율']))
print(int(selected['지배주주지분']))

#df.to_csv()



# %%



# %%
import requests
from bs4 import BeautifulSoup

url = 'http://comp.fnguide.com/SVO2/ASP/SVD_Finance.asp?pGB=1&gicode=A112610&cID=&MenuYn=Y&ReportGB=&NewMenuID=103&stkGb=701'

res = requests.get(url)
html = res.text
soup = BeautifulSoup(html, 'html.parser')


table = soup.select_one('#divDaechaY')

theader = soup.select_one('thead')
#print(theader)
headers = table.select("tr")
cols = []
for col in headers[0].select("th"):
    if col.a != None:
        cols.append(col.a.text)
    else:
        cols.append(col.text)
print(cols)
data = []
for row in table.tbody.select("tr"):
    rdata = []
    if row.th.span != None:
        rdata.append(row.th.span.text.strip('\xa0').strip('\n'))
    else:
        rdata.append(row.th.text.strip('\xa0').strip('\n'))

    for cell in row.select("td"):
        v = cell.text.replace(',','').strip('\xa0')
        rdata.append(v)
    data.append(rdata)
print(data)

def get_value(cols, data, colname, rowname):
    colidx = cols.index(colname)
    rowidx = -1
    for ii in range(len(data)):
        if data[ii][0] == rowname:
            rowidx = ii
            break
    return data[rowidx][colidx]

def get_int_value(cols, data, colname, rowname):
    colidx = cols.index(colname)
    rowidx = -1
    for ii in range(len(data)):
        if data[ii][0] == rowname:
            rowidx = ii
            break
    try:
        rc = float(data[rowidx][colidx])
    except ValueError:
        rc = 0
    return rc

str_date = cols[len(cols)-1]
print(str_date)

v = get_int_value(cols, data, '2020/06', '자산')
유동자산 = get_int_value(cols, data, '2020/06', '유동자산')
투자부동산 = get_int_value(cols, data, '2020/06', '투자부동산')
장기금융자산 = get_int_value(cols, data, '2020/06', '장기금융자산')
지분투자자산 = get_int_value(cols, data, '2020/06', '관계기업등지분관련투자자산')

유동부채 = get_int_value(cols, data, '2020/06', '유동부채')
비유동부채 = get_int_value(cols, data, '2020/06', '비유동부채')

유동자산 + 투자부동산 + 장기금융자산 + 지분투자자산 - 1.2 * 유동부채 + 비유동부채
