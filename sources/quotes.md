# Source quotes for FOptInf 05

Two rounds. The sections below "Opened by the planner, 2026-10-20" are pages the planner opened, from a network
that reached arXiv, opencompute.org, NVIDIA and the explainer site; they supersede the "could not open" notes of
the first round where they overlap. The first-round sections follow them, unchanged.

Gathered 2026-10-19. **How access worked:** WebFetch could not resolve any host except github.com and
raw.githubusercontent.com. Every arxiv.org, export.arxiv.org, huggingface.co, alphaxiv, proceedings.mlr.press,
icml.cc, opencompute.org, developer.nvidia.com and github.io fetch failed with `getaddrinfo ENOTFOUND`. As a result:
- No primary paper PDF or abstract page was opened.
- Every quote below comes from an official code repository (README or source) or from the series' own decks on
  GitHub raw.
- Each section says whether its source is **primary** (the authors' own repository) or **secondary** (the series
  deck summarising the paper).

WebFetch returns text that a model has summarised. The quotes are what the tool returned as verbatim. Check
load-bearing numbers against the PDFs before you publish.


# Opened by the planner, 2026-10-20

## Module paper (opened by the planner, 2026-10-20)
- Citation: Kundu et al., "Programmable Compute-in-Transit using Integrated Photonics", arXiv:2608.21536 (2026). Authors are at the module's developer.
- URL: https://arxiv.org/abs/2608.21536 (PDF opened: https://arxiv.org/pdf/2608.21536)
- Quotes:
  - §V "Future work": "integrates a 112 GBaud/s Photonic Integrated circuit (PIC) with Analog Mixed Signal (AMS), Analog Front End (AFE) electronics and custom high-speed logic operating at 28 GHz."
  - §V: "We are integrating the compute-in-transit IPs in a monolithic silicon photonic chip to compute operations such as MAC, FFT and NTT during data transit."
  - §V: "For example, 45 GFLOPS of FP4 (E2M1) MAC is enabled on a 112 GBaud/s photonic transceiver link for an additional 1 pJ/bit. Since the core compute technology is passive…"
  - §II: "The Photonic PDK devices used in the current system can operate at 14 GBaud/s (28 Gbps PAM4)"
- Note: §V says *monolithic*. The 3D stacking modelled by the simulator is the developer's public statement (tagged public-statement), not §V.

## PRISM (opened by the planner, 2026-10-20)
- Citation: Park and Park, PRISM, arXiv:2603.21576.
- URL: https://arxiv.org/abs/2603.21576
- Quote: "only rank order matters (relaxing precision to 4-6 bits)"

## MuLoCo (opened by the planner, 2026-10-20)
- Citation: Therien et al., "MuLoCo: Muon is a Practical Inner Optimizer for DiLoCo", arXiv:2505.23725.
- URLs: https://arxiv.org/abs/2505.23725v1 and https://arxiv.org/abs/2505.23725 (v3, current)
- Quotes:
  - v1: "aggressively compress the communicated delta to 2-bits with next to no performance degradation"
  - v3: "Both MuLoCo and DiLoCo achieve lossless 4-bit quantization"
  - v3, as summarised by the planner: 2-bit linear quantisation is impractical; 2 bits needs statistical quantisation.

## OCP Microscaling Formats (MX) v1.0 (opened by the planner, 2026-10-20)
- URL: https://www.opencompute.org/documents/ocp-microscaling-formats-mx-v1-0-spec-final-pdf
- Quotes:
  - Format table: "MXFP4 FP4 (E2M1) 4 32 E8M0 8"
  - §6.3: "Set X to be the largest power-of-two less than or equal to max(|Vi|), divided by the largest power-of-two representable in the element data type"
- Note: for E2M1 the largest power of two representable is 4 = 2^2, so X = 2^(floor(log2 amax) − 2), as analysis/precision_needed.py implements.

## NVFP4 (opened by the planner, 2026-10-20)
- URL: https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/
- Quote: "applies a fine-grained E4M3 scaling factor to each 16-value micro-block … a second-level FP32 scalar applied per tensor"

## KVQuant (opened by the planner, 2026-10-20)
- URL: https://arxiv.org/abs/2401.18079
- Quote: "< 0.1 perplexity degradation with 3-bit quantization"

## Further papers (opened by the planner, 2026-10-20; cited, no quote used)
- KIVI: https://arxiv.org/abs/2402.02750
- Quest: https://arxiv.org/abs/2406.10774
- FNet: https://arxiv.org/abs/2105.03824
- CirCNN (block-circulant weights): https://arxiv.org/abs/1708.08917

## DeMo (opened by the planner, 2026-10-20)
- Citation: Peng, Chen, Su, Quesnelle, Kingma, Liu, "DeMo: Decoupled Momentum Optimization", arXiv:2411.19870.
- URLs: https://arxiv.org/abs/2411.19870 ; code: https://raw.githubusercontent.com/bloc97/DeMo/main/demo.py
- Code reference: `compression_chunk` (default 64) is applied per dimension, so a 2-D tensor is split into chunks of up to 64×64 values (64 for 1-D tensors); `compression_topk` (default 32) values are kept per chunk.

## Hyena (opened by the planner, 2026-10-20; cited, no quote used)
- https://arxiv.org/abs/2302.10866 . The deck's "Hyena (order 2)" is the series' Hyena variant of order 2 (flop_share.py), not a different model.

## Digital energies: Horowitz via Han et al. (opened by the planner, 2026-10-20)
- Citation: "Horowitz, ISSCC 2014, 45 nm", as tabulated in Han et al., arXiv:1602.01528, Table I.
- URL: https://arxiv.org/abs/1602.01528
- Quotes (Table I, pJ): "32 bit int ADD 0.1", "32 bit int MULT 3.1"

## Explainer site (opened by the planner, 2026-10-20)
- https://photonic-link-module-explained.vercel.app/method/
- https://photonic-link-module-explained.vercel.app/chapters/stacked-chip/
- https://photonic-link-module-explained.vercel.app/chapters/break-even-at-scale/
- https://photonic-link-module-explained.vercel.app/chapters/approximate-mode/
- https://photonic-link-module-explained.vercel.app/chapters/energy/
- https://photonic-link-module-explained.vercel.app/chapters/light-and-heat/
- https://photonic-link-module-explained.vercel.app/chapters/calibration-at-scale/

# First round (opened 2026-10-19)

## KIVI
- Citation: Zirui Liu, Jiayi Yuan, et al., "KIVI: A Tuning-Free Asymmetric 2bit Quantization for KV Cache", ICML 2024 (PMLR v235), arXiv:2402.02750.
- URL opened: https://github.com/jy-yuan/KIVI (authors' official repo, README). arXiv page could not be opened.
- Date opened: 2026-10-19
- Quotes (README):
  - "This algorithm optimizes memory usage by quantizing the key cache per-channel and the value cache per-token to 2bit."
  - "KIVI is a new plug-and-play 2bit KV cache quantization algorithm without any fine-tuning."
  - "reducing peak memory usage by 2.6 times"
  - "This enables up to 4 times larger batch sizes"
  - "significantly increases throughput by 2.35 to 3.47 times in real LLM inference workloads"
- Note: the author list above is the first two authors only. It was not read on an opened page; check it on arXiv.

## KVQuant
- Citation: Coleman Hooper, Sehoon Kim, Hiva Mohammadzadeh, Michael W. Mahoney, Yakun Sophia Shao, Kurt Keutzer, Amir Gholami, "KVQuant: Towards 10 Million Context Length LLM Inference with KV Cache Quantization", NeurIPS 2024 (per repo header), arXiv:2401.18079.
- URL opened: https://github.com/SqueezeAILab/KVQuant (README)
- Date opened: 2026-10-19
- Quotes (README):
  - "KVQuant enables serving the LLaMA-7B model with 1M context length on a single A100-80GB GPU"
  - "or even the LLaMA-7B model with 10M context length on an 8-GPU system"
- Not found on the opened page: the README had no 3-bit or sub-4-bit statement and no perplexity-degradation figure. These need the arXiv abstract, which could not be opened.

## PRISM (photonic KV block selection), secondary only
- Citation (as given in the CiT_03 deck): Park and Park, PRISM, arXiv:2603.21576. The deck says the authors are "not the module's developer".
- URL opened: https://raw.githubusercontent.com/BrendanJamesLynskey/CiT_03_Data_Movement_in_LLM_Inference/main/index.html (CiT_03 deck, slide 06). The arXiv page could not be opened.
- Date opened: 2026-10-19
- What it does: an optical similarity engine that ranks KV blocks for query-aware selection. It is a **ranking/selection** paper, not a KV compression paper.
- Quotes (CiT_03 slide 06, "Fetch Only What Matters: Query-Aware KV Selection"):
  - "proposes a thin-film lithium niobate photonic similarity engine for KV block selection, arguing that ranking needs only 4 to 6 bits."
  - "The authors report 100% needle-in-a-haystack accuracy from 4K to 64K tokens on Qwen2.5-7B"
  - "the authors' claims, not yet reproduced"
- Not checked: other arXiv papers named PRISM on KV cache. The only search done was for this one.

## CiT_03 deck (KV ranking bits)
- Citation: B. J. Lynskey, "Compute in Transit 03: Data Movement in LLM Inference", 2026 (deck).
- URL opened: https://raw.githubusercontent.com/BrendanJamesLynskey/CiT_03_Data_Movement_in_LLM_Inference/main/index.html. github.io would not resolve.
- Date opened: 2026-10-19
- Quotes:
  - Slide 06: "ranking needs only 4 to 6 bits" (the deck attributes this to PRISM, see above).
  - Slide 06: "Scoring a key against the query (head dimension 128) is a dot product: 2 FLOPs per BF16 value"
  - Slide 11 (candidate table), query-aware selection noise tolerance: "high (ranking only)"
  - Slide 13: "PRISM shows others are exploring the scoring optically."

## Quest
- Citation: Jiaming Tang, Yilong Zhao, Kan Zhu, Guangxuan Xiao, Baris Kasikci, Song Han, "Quest: Query-Aware Sparsity for Efficient Long-Context LLM Inference", ICML 2024, arXiv:2406.10774.
- URL opened: https://github.com/mit-han-lab/Quest (README)
- Date opened: 2026-10-19
- Quotes (README / abstract):
  - "Quest keeps track of the minimal and maximal Key values in KV cache pages"
  - "By only loading the Top-K critical KV cache pages for attention"
  - "We show that Quest can achieve up to 7.03× self-attention speedup, which reduces inference latency by 2.23×"
- Bit width: the README makes no low-bit-key claim. Its only precision mention is "on FP16 LongChat-7B-v1.5-32K" (demo). No source found that states "4-bit keys are sufficient for top-k".

## MuLoCo
- Citation: Benjamin Therien, Xiaolong Huang, Aaron Defazio, Irina Rish, Eugene Belilovsky, "MuLoCo: Muon is a Practical Inner Optimizer for DiLoCo", arXiv:2505.23725 (author list as on the repo).
- URLs opened: https://github.com/facebookresearch/MuLoCo (README: title, authors and arXiv number only, with no compression numbers); https://raw.githubusercontent.com/BrendanJamesLynskey/CiT_02_Data_Movement_in_LLM_Training/main/index.html (secondary).
- Date opened: 2026-10-19
- Quotes (CiT_02 deck, secondary, which says these are "figures from the v1 abstract"):
  - Slide 06: "Delta compressed to 2 bits with next to no degradation; communicates 8× less than DiLoCo"
  - Slide 04: "8x = BF16 to 2-bit (MuLoCo's setting)"
- The arXiv abstract could not be opened.

## DeMo
- Citation: "DeMo: Decoupled Momentum Optimization", arXiv:2411.19870 (2024). Authors not listed on the opened page.
- URLs opened: https://raw.githubusercontent.com/bloc97/DeMo/main/demo.py (official code); https://raw.githubusercontent.com/BrendanJamesLynskey/CiT_02_Data_Movement_in_LLM_Training/main/index.html (secondary).
- Date opened: 2026-10-19
- Quotes (demo.py, `DeMo.__init__` defaults):
  - "compression_topk: int = 32,"
  - "compression_chunk: int = 64,"
  - "compression_decay: float = 0.999,"
  - "self.transform = TransformDCT(self.param_groups, self.compression_chunk)"
- Quote (CiT_02 slide 08, secondary): "up to 85× less data per GPU than AdamW with DDP, at comparable loss and accuracy"

## CiT_04 (fixed-band DeMo negative result)
- Citation: B. J. Lynskey, "Compute in Transit 04: The Fixed-Band Experiment", 2026 (deck).
- URL opened: https://raw.githubusercontent.com/BrendanJamesLynskey/CiT_04_Fixed_Band_Experiment/main/index.html (first 100k characters read), plus README.md
- Date opened: 2026-10-19
- Quotes:
  - README: "A 15.8M-parameter GPT trained on TinyStories with eight simulated workers says no"
  - README: "every fixed band ends more than a nat above top-k, and half the bytes per step does not buy the loss back."
  - Slide 04: "Top-k DeMo ends 0.139 above AdamW. Every fixed band ends more than a nat above top-k." Final validation loss at 3,000 steps: AdamW 1.646 ± 0.005; DeMo top-k 2-D 64×64 1.785 ± 0.007; low band 1-D 256 3.124 ± 0.008; low band 2-D 64×64 3.158 ± 0.009 (3 seeds each).
  - Slide 03: "with eight workers DeMo's all-gather turns 8× and 16× payload savings into 2.0× and 4.0×."
  - Slide 06: "in 2-D chunks the low band keeps 0.013 of the momentum's energy" (top-k keeps 0.643)
  - Slide 10: "ENOB 8 is enough for the band itself." (ENOB 6: 3.423; ENOB 8: 3.017; single seeds)

## CiT hub results.md
- URL opened: https://raw.githubusercontent.com/BrendanJamesLynskey/LLM_Hub_Compute_in_Transit/main/analysis/results.md
- Date opened: 2026-10-19
- Quotes (Section 5, synthetic signals, 64×64 2-D DCT, keeping 1/16): smooth 2-D random walk, top-k 0.995 vs fixed band 0.957; white noise, 0.325 vs 0.062.
  - "A fixed band matches top-k only when energy sits at low frequencies (the smooth case)."

## Photonic link module paper, secondary only
- Citation: Kundu et al., "Programmable Compute-in-Transit using Integrated Photonics", arXiv:2608.21536 (2026). Authors are at the module's developer.
- Paper: **could not be opened** (arXiv DNS failure). The page I opened was the series' CiT_01 deck: https://raw.githubusercontent.com/BrendanJamesLynskey/CiT_01_Compute_in_Transit/main/index.html
- Date opened: 2026-10-19
- Quotes (CiT_01 deck, which cites paper sections II and IV only):
  - Slide 03: "The photonic devices run at 14 GBaud, with NRZ data into the module; module power is 9.7 W."
  - Slide 05: "The photonic chip carries Mach-Zehnder modulators." and "a proprietary passive diffractive device that computes Optical Fourier Transform (OFT)." The deck also lists balanced photodiodes for coherent detection (sec. II).
  - Slide 08: "the paper projects FP4 MAC on a future link." and "no ENOB or error figure is published."
  - Slide 03, from the developer's website, not the paper: "Native 384 GOPS / lambda @ 32GSps (GF45nm)"; "Estimated 2.76 pJ/bit link energy on 45 nm silicon photonics, excluding the laser." The deck says: "The GOPS and pJ/bit figures are company estimates."
- 112 GBd, 28 GHz logic and 3D stacking (sec. V) are **not** in the CiT_01 deck. They appear only in this repo's vendored simulator notes (data/plms_v0_3/results_extract.md: "section V projection: 112 GBd PIC", "section V: 28 GHz logic"). Those notes are not the paper. Verify against the paper.

## NVFP4
- URL opened: https://raw.githubusercontent.com/NVIDIA/TransformerEngine/main/docs/features/low_precision_training/nvfp4/nvfp4.rst (NVIDIA Transformer Engine docs). The NVIDIA blog could not be opened.
- Date opened: 2026-10-19
- Quotes:
  - "The NVFP4 datatype consists of 1 sign bit, 2 exponent bits, and 1 mantissa bit (E2M1)."
  - "It can represent values of magnitude up to +/- 6."
  - "s_block is a local FP8 E4M3 scaling factor shared by a block of 16 consecutive elements,"
  - "s_global is a global FP32 scaling factor applied to the entire tensor."
  - "Block size is 16 (vs 32 for MXFP8)" / "Scaling factors are stored as FP8 E4M3 (vs E8M0 for MXFP8)"

## FP8 E4M3 / E5M2 maxima (code)
- URL opened: https://raw.githubusercontent.com/NVIDIA/TransformerEngine/main/transformer_engine/common/recipe/__init__.py
- Date opened: 2026-10-19
- Quotes: "E4M3 = _FormatHelper(max_fwd=448, max_bwd=448)"; "E5M2 = _FormatHelper(max_fwd=57344, max_bwd=57344)"; NVFP4 scale "is E4M3 (4 bits of exponent," "3 bits of mantissa)"
- This is not the Micikevicius et al. paper (arXiv:2209.05433), which could not be opened.

## MX (microscaling) reference code
- URL opened: https://github.com/microsoft/microxcaling (README)
- Date opened: 2026-10-19
- Quotes: block size "For MX-compatible formats this should be 32."; "# MXFP4_e2m1 matmuls with bfloat16 vector ops, forward pass only". The README links to the OCP MX v1.0 spec but does not mention E8M0.
- E8M0 for MX appears only through the NVFP4 doc above ("vs E8M0 for MXFP8"). The FP4 maximum of 6 is stated only in the NVFP4 doc.

## FNet
- Citation: James Lee-Thorp, Joshua Ainslie, Ilya Eckstein, Santiago Ontanon, "FNet: Mixing Tokens with Fourier Transforms", arXiv:2105.03824.
- URL opened: https://github.com/google-research/google-research/tree/master/f_net (README)
- Date opened: 2026-10-19
- Quote: "the self-attention sublayers have been wholly replaced by standard, unparameterized Fourier Transforms."

## Hyena
- Citation: Poli, Massaroli, Nguyen, Fu, Dao, Baccus, Bengio, Ermon, Ré, "Hyena Hierarchy: Towards Larger Convolutional language models", ICML 2023 (Oral), arXiv:2302.10866.
- URL opened: https://github.com/HazyResearch/safari (README)
- Date opened: 2026-10-19
- The README gives only the title, authors and venue. It has no statement on long convolutions or FFT, so there is no mechanism quote.

## Could not open
Every failure below was `getaddrinfo ENOTFOUND`. Only GitHub hosts resolved.
- arXiv:2608.21536 (abs, html, pdf): Section V (112 GBd, 28 GHz logic, the exact FP4 MAC wording, 3D stacking, throughput projections) and Section II details were **not read from the paper**.
- arXiv abstracts for 2402.02750, 2401.18079, 2411.19870, 2406.10774, 2505.23725, 2603.21576, 2310.10537, 2209.05433, 2105.03824, 2302.10866, 1708.08917.
  - Missing as a result: KVQuant's 3-bit/perplexity numbers; DeMo's authors and abstract wording; the FP8 paper's mantissa-bit statements.
- Other PRISM papers on KV cache: not searched beyond arXiv:2603.21576.
- CirCNN (arXiv:1708.08917): no page opened, so there is nothing to quote.
- OCP MX v1.0 spec PDF (opencompute.org).
- NVIDIA blog "Introducing NVFP4 for efficient and accurate low-precision inference" (developer.nvidia.com).
- CiT_03 and CiT_04 github.io sites: read through their GitHub raw index.html instead.
- Explainer site photonic-link-module-explained.vercel.app: could not be opened. Its GitHub repo is private and not attached to this session, so the Part II chapter 12–17 titles and URLs are **not recorded**.
- Horowitz, ISSCC 2014: no page opened. The 45 nm energy figures (0.1 / 3.1 / 0.03 / 0.2 pJ) are **not verified**.
