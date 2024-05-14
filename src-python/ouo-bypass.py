import importlib
import os
import sys
import re
from curl_cffi import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import tempfile
import shutil
import warnings
from urllib3.exceptions import InsecureRequestWarning
import logging

# 로그 설정
logging.basicConfig(filename='ouo_bypass.log', level=logging.DEBUG,
                    format='%(asctime)s %(levelname)s:%(message)s', encoding='utf-8')

# 경고 무시 설정
warnings.simplefilter('ignore', InsecureRequestWarning)
warnings.filterwarnings("ignore", category=UserWarning,
                        module='curl_cffi.requests.cookies')

# 인증서 파일 경로 설정
cert_path = os.path.join(os.path.dirname(__file__), 'curl_cffi', 'cacert.pem')
logging.debug(f"Using cert file at: {cert_path}")


def RecaptchaV3():
    logging.debug("RecaptchaV3 시작")
    import requests
    # InsecureRequestWarning 경고 무시
    warnings.simplefilter('ignore', InsecureRequestWarning)

    ANCHOR_URL = 'https://www.google.com/recaptcha/api2/anchor?ar=1&k=6Lcr1ncUAAAAAH3cghg6cOTPGARa8adOf-y9zv2x&co=aHR0cHM6Ly9vdW8ucHJlc3M6NDQz&hl=en&v=pCoGBhjs9s8EhFOHJFe8cqis&size=invisible&cb=ahgyd1gkfkhe'
    url_base = 'https://www.google.com/recaptcha/'
    post_data = "v={}&reason=q&c={}&k={}&co={}"
    client = requests.Session()
    client.verify = cert_path

    client.headers.update({
        'content-type': 'application/x-www-form-urlencoded'
    })
    matches = re.findall('([api2|enterprise]+)\/anchor\?(.*)', ANCHOR_URL)[0]
    url_base += matches[0]+'/'
    params = matches[1]
    res = client.get(url_base+'anchor', params=params)
    token = re.findall(r'"recaptcha-token" value="(.*?)"', res.text)[0]
    params = dict(pair.split('=') for pair in params.split('&'))
    post_data = post_data.format(params["v"], token, params["k"], params["co"])
    res = client.post(url_base+'reload',
                      params=f'k={params["k"]}', data=post_data)
    answer = re.findall(r'"rresp","(.*?)"', res.text)[0]
    res.close()
    client.close()
    logging.debug("RecaptchaV3 완료")
    return answer


client = requests.Session()
client.headers.update({
    'authority': 'ouo.io',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'cache-control': 'max-age=0',
    'referer': 'http://www.google.com/ig/adde?moduleurl=',
    'upgrade-insecure-requests': '1',
})


def ouo_bypass(url):
    logging.debug("ouo_bypass 시작")
    tempurl = url.replace("ouo.press", "ouo.io")
    p = urlparse(tempurl)
    id = tempurl.split('/')[-1]
    logging.debug(f"요청 URL: {tempurl}")
    try:
        res = client.get(tempurl, impersonate="chrome110", verify=cert_path)
    except Exception as e:
        logging.error(f"요청 실패: {e}")
        return None

    next_url = f"{p.scheme}://{p.hostname}/go/{id}"
    logging.debug(f"다음 URL: {next_url}")

    for _ in range(2):
        logging.debug("루프 시작")
        if res.headers.get('Location'):
            logging.debug("Location 헤더 발견")
            break

        bs4 = BeautifulSoup(res.content, 'lxml')
        inputs = bs4.form.findAll("input", {"name": re.compile(r"token$")})
        data = {input.get('name'): input.get('value') for input in inputs}
        data['x-token'] = RecaptchaV3()

        h = {
            'content-type': 'application/x-www-form-urlencoded'
        }

        res = client.post(next_url, data=data, headers=h,
                          allow_redirects=False, impersonate="chrome110", verify=cert_path)
        next_url = f"{p.scheme}://{p.hostname}/xreallcygo/{id}"
        logging.debug("루프 완료")

    r_links = res.headers.get('Location')
    logging.debug(f"리디렉션 링크: {r_links}")
    res.close()
    client.close()
    logging.debug("ouo_bypass 완료")
    return r_links


if __name__ == "__main__":
    logging.debug("스크립트 시작")
    if len(sys.argv) < 2:
        logging.error("Usage: script.exe <url>")
        sys.exit(1)
    url = sys.argv[1]
    logging.debug(f"URL: {url}")
    result = ouo_bypass(url)
    if result:
        logging.debug(result)
        print(result)
    else:
        logging.debug("No redirected URL found.")
    logging.debug("스크립트 완료")
