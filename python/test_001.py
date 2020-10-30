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



