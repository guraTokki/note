# curl "http://wisefn.stock.daum.net/v1/company/cF3002.aspx?cmp_cd=005930^&frq=0^&rpt=1^&finGubun=MAIN" 
# -H "Connection: keep-alive" 
# -H "Upgrade-Insecure-Requests: 1" 
# -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36" 
# -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8" 
# -H "Referer: http://wisefn.stock.daum.net/v1/company/c1030001_1.aspx?cmp_cd=005930" 
# -H "Accept-Encoding: gzip, deflate" 
# -H "Accept-Language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7" 
# -H "Cookie: webid=eec1963a2ee646ea907ef4f09de2a8f4; _ga=GA1.2.1877372348.1540899452; _gid=GA1.2.1364208353.1542160571; webid_sync=1542160585411; ASP.NET_SessionId=uqevtdv5rkbl4etwdrl014wd; TIARA=YKza7CaLU-aYzYWRmF.foho_m8caIb9VkeXqyNs2BJdEnspkvAkIh8wWLrbPMds_rdsA5fwoi2pNMH4EWSslVQ00; _gat_gtag_UA_74989022_11=1; _gat_gtag_UA_128578811_1=1; _dfs=L2pGYXVyb2kzTkJMTFFiZmlkN2duL09nL1N5Yjg1c0RrV0JFclhPbngzV2FqR3lObzRjalNpdWYxaFBxMDhJM2V5WXVHL25UL2NNRFpQeFBZTnM0cEE9PS0tdmttSFp0dmllcmhXemtId0VVVkx4dz09--4943fed439e8862f1458765eafadcbce6ccda5b9" 
# --compressed


import requests
from bs4 import BeautifulSoup

def save_finance_html(code,dirName):
    # code = '005930'
    # code = '000660'
    url = "http://wisefn.stock.daum.net/v1/company/cF3002.aspx?cmp_cd="+code+"^&frq=0^&rpt=1^&finGubun=MAIN"
    referer = {'referer': 'http://wisefn.stock.daum.net/v1/company/c1030001_1.aspx?cmp_cd='+code}

    s = requests.Session()
    s.headers.update(referer)
    s.headers.update({'User-Agent': ''})
    #print(s.headers)
    r = s.get(url)

    soup = BeautifulSoup(r.text, 'html.parser')
    #print(soup)

    fname = dirName+'./finance_'+ code + '.html'
    #print(r.text)
    f = open(fname, 'w')
    f.write(r.text)
    f.close()

#save_finance_html('000660')
