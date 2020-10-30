import requests
from bs4 import BeautifulSoup

#url = 'http://wisefn.stock.daum.net/v1/company/c1010001.aspx?cmp_cd=005930'
#url = 'https://finance.naver.com/item/main.nhn?code=047820'
url = 'https://finance.naver.com/item/coinfo.nhn?code=047820'


res = requests.get(url)
html = res.text
soup = BeautifulSoup(html, 'html.parser')
print(soup)