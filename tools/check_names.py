#!/usr/bin/env python3
"""Naming check: the repository names no company except the authors and institutions of cited sources.

The module's developer is never named, so this script cannot list it in clear either. It holds SHA-256 hashes of
lower-cased company names (photonic-computing and optical-interconnect companies, and chip and cloud companies that
no cited source is by); it hashes every word, and every two and three adjacent words joined, in every text file of
the repository and fails on a match. Names of cited sources' institutions (the NVFP4 and MX documentation, the
FNet and DeMo repositories, the HBM datasheet) are not in the list. The planner runs its own hashed check after.

Usage: python3 tools/check_names.py [paths...]   (default: every text file in the repository, data/ and reference/ included)
"""

from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HASHES = set(["047364b9be67f665eca384b8061d688b8642a8b47b3de35c22a012ed6fe69242", "0b79cf2de0ee6b8ee227d9ebfe69b91aa92b1d2509641c4b743518447dbc4c68", "17840323ea59b5e1c1383d90f5e688fe7441b1de61ff8679d37f16591f261569", "17b7a45dc3a95bfd7c0d4c5963b75f2bd2c962eb04b50d50c086c3dc2e260fea", "1b938deea9e21663c80b27311f7e47d49d25af5b30269ef742fdfab0c24c2685", "1db9e4de9eaff2131b67e11059596938f377aae8568fb90b1086c1fc558ec386", "2301cf64445269348beaa9272011e1ea13bba527054cced90b2c690eb084d90f", "23ee7360409471e1f9dad62f9f272488b359a57ffa02e19b4e44ffd483302eda", "2ab6d53e717a0e0d773ccfdb8b0e84ac494729c6b567c72d256b883a9db17ea8", "2d8831d39a2f82cf8dcb36c38c6474699156b3e16899becc9f52450b1e2baf5f", "30c426ebe94604ed094d789d49629eb78c761d7fd0acc7b0422cf6e7f4467661", "373ac021a2c0bb2cfd45f53411044b551f8cdd6aaeb2cde56a6d97635379117d", "37e6966856609c3508b2c0d12a3106baf2323979bda185f1075a85345261c844", "3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b", "4226217129c90fe47b61277245f84cede5b398c81dfb7a26cc9f60238f76a127", "4742b2b6563b92ed635b3aab63f5d02f4af8931c80b7d349ece5355af48263cf", "47679f81beb4cebdae386945efc2bc60b9b2e849de04f8c76866ad2c11f5a917", "4f421bcd9139b8bdc45a4b5d8f02305f9e808938e320e6b7aa05cc4f27e854c6", "4fa3c402ca33fa57eecc61bdfce27113f0904f73a04b8b7189e1f7f5dd598f56", "5388bc10736a0eff09be2ab9c8369a9c1cd14ef7916dafe4e177da6903aefdec", "56018fe135c84cb3af995473a79669e46d0a02b12b8b3141aba2d2ad19d66f70", "5adfe2a7748ebad91cd5cde0007292187b5c78cb07f5a022928290e9d71552e5", "69a56cdf2ee453b777b8b8d56097bd009574f250b68d46e00a68a538e898b14c", "6f62a5644afa119916b740bae6623fa6c5c0a5b4900c4624510890450aad612a", "77b30b8a88051252a94c391bf8a60d228a53fe85371a95dd7fa13350fbe59ca1", "7ced6fc1903f5a85241e44172f238a8289e2844eac02fd3f5dcc0c9cb75a0636", "7d3194f79e645c42e4396dda38be04766810ec6a00d00aced3ffc2a0a1f1a9ef", "832e91e5a273d861aefe244c3d3c6e1ef8a27044c6a46e87c4645de4d6d2c01f", "85c13293783e9420e3d5c5f92e49401c91db1f01ef2444016e519a548d74e7b1", "8e2750e174016c3e0c5eee0b6aba8a4b1bc3993a17d0cd5b7a712db65fc33df1", "90642c3dd333bc0e602c9fa887ab0f0482886d0ed52ce8762a27a5f901528fcc", "916a98f0fa2a39af1a736b1a3744cb655dc8638a6953e2fb13e39934ab60d55a", "968e2d5b08687bf42997461cbdef6c844eabbf04f440cee888c95b864c2a4bcc", "96eebba49dbbf422d245f02290f9d4ed0eb02da9daa6bbceefb162800ff42481", "99546aa80b4aff4c96a297de944fc891d387ea03ac84a526d9c2c4d053acfd4c", "99df021aa1470bf76bb630ab14694b0c1f9daa5a7d7c3acbf56352d16db25865", "9a6e2353718bd9517827f6558f9dea09d2144c3385b351cddd6532cda589491d", "9c8ae69b84f21a2e46df9edf0063a697afec050188ff2884ddc8ab32b5e58c43", "9e3caca2a384aec2a1036515ba7a725bc7ad83001974e0dcef529f4321eb02ee", "a481563f60e004154fbf82a5f99fce87e50d78dd2b246eb96ca0e0ee79f779a5", "a89151ba4b5ac0f22e96b71b963db927791d3808f5175f06ae4a60de5891bf0f", "aea659d357eba2731dbab054c2c92ffb02d942bc0536eedf9b6e66b8f8138d7f", "b81c8201acfc7639be3bd3d7f875ba5ca76e422fa2163cec9dace50662b637a7", "b97a91a591962ebe37c85a1b028ab7e88f6f2338b5dabcd8ea230224f227524f", "b9eeb4894a166459c6ee28f14b47656b53d9d242eed1e929062ffd6c2a1494a7", "ba62ec88d564e07c64a50de6533ced8c8a92810f0074484bce989dc3c41383fe", "bb317363dcbbf9262dbf15c03e48a8288f2da5e76c41e09162710e01f8564e9d", "bc236a8abd26671b4cb71310f98c56a3222e3a13ae51af5ab59d38ffca2ec90a", "ca6e0dc328e4570d5a249d57980b2a03b24da6877b698b953201d6eb906fe09d", "cbc62794911ff31b2864ecd3dbbbee7ebcb7ea41c5a42e2cba377f3cfdb42811", "cd3a83e24479323a98cefeeb8266b03033c1d139d292445864e169d6a88490ca", "cd571a7b80cce4ca38106524c874f355a30588f0255137cae1ff9b5b248aed93", "ce8f95989734b16081bc4b4042d1c94ecd545f644ad921c8c618de70b0abd95f", "d7aba0f660c463d8845b4478e4b5b73a2406bd209cf379e2bd8e1445a86586ba", "dc089a5e49523336c9b7dcc80ba0494738913c1a1e09d3c84df4d2fba97bb287", "dfc0fdff7af68ed25e26ce99ffa7c2599d40fc25c806a6d232c8ff68c7202c86", "e73b79a0b10f8cdb6ac7dbe4c0a5e25776e1148784b86cf98f7d6719d472af69", "ed1f878375534058e8fb085896590edb37d040972d4de9c494d73b6027d81cdb", "f1a6f60be07e303815f5bb8dbdcbcae8a6bb374f2bdeb678767d3edcb1e5e7ec", "f2ed4886e20f1a035f5e45c9ae06e5c07a700e08a9b1cf63282e16a7943e0c86", "f31639a23c7440153fe07af3ef6833aa900064c4df50fb23a1739797dde073ea", "f4faef07d12f9e42caec0b9c7575c44a1ed82c511a0ec6dd8539ec9e653a138c", "fd25d83193f22509720f70249c9a127a4e007e42db1333dfa6ab80c7627b340a", "fd98b9c7b97a844c55127dcd177c8a82cce6ec4c3bcdc5d2dc1881f89f67cafa"])
TEXT = {".py", ".js", ".json", ".md", ".html", ".css", ".yml", ".yaml", ".txt", ".toml", ".cfg"}
SKIP = {".git", "node_modules", "artifacts", "__pycache__", ".pytest_cache"}


def h(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()


def scan(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9]+", text.lower())
    hits = set()
    for n in (1, 2, 3):
        for i in range(len(words) - n + 1):
            w = "".join(words[i:i + n])
            if h(w) in HASHES:
                hits.add(w)
    return hits


def files(args: list[str]):
    if args:
        yield from (Path(a) for a in args)
        return
    for p in ROOT.rglob("*"):
        if p.is_file() and p.suffix in TEXT and not (set(p.relative_to(ROOT).parts) & SKIP):
            yield p


def main() -> int:
    bad = []
    for p in files(sys.argv[1:]):
        hits = scan(p.read_text(errors="ignore"))
        if hits:
            # report the hash prefix, not the name, so the log never prints it either
            rel = p.relative_to(ROOT) if p.resolve().is_relative_to(ROOT) else p
            bad.append(f"{rel}: {len(hits)} match(es), hash {sorted(h(x)[:12] for x in hits)}")
    if bad:
        print("company names found:\n" + "\n".join(bad))
        return 1
    print(f"check_names: no listed company name in the repository ({len(HASHES)} hashed names)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
