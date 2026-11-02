/**
 * Blog content for /blogs.
 *
 * Posts live in code rather than a CMS: the site has no runtime data layer,
 * and every article is static at build time. Add a post here and it appears
 * on the index, in the sitemap and at /blogs/<slug>.
 */

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "code"; language: string; filename?: string; code: string }
  | { type: "quote"; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date, used for display, metadata and structured data. */
  date: string;
  category: string;
  readingTime: number;
  author: string;
  tags: string[];
  featured?: boolean;
  blocks: BlogBlock[];
};

export const POSTS: BlogPost[] = [
  {
    slug: "llvm-optimisation-levels-in-cheeku",
    title: "LLVM optimisation levels land in Cheeku",
    excerpt:
      "Cheeku now exposes O0 through O3, a generic CPU target and opt-in diagnostic artifacts. The runtime checks stay exactly where they were.",
    date: "2026-10-29",
    category: "Compiler",
    readingTime: 6,
    author: "Chuchu team",
    tags: ["LLVM", "Optimisation", "Cheeku"],
    featured: true,
    blocks: [
      {
        type: "paragraph",
        text: "Cheeku now compiles through LLVM's new pass manager at four optimisation levels. O0 skips the optional IR pipeline, O1 simplifies scalar code, and O2 or O3 add loop and SLP vectorisation. O2 remains the default, so existing builds get a faster binary without changing a single command.",
      },
      {
        type: "paragraph",
        text: "The target is configured before any pass runs. By default Cheeku uses a generic CPU for the detected host architecture, which keeps the executable portable across machines of the same architecture. Passing --cpu native opts into the host CPU's specific features; that binary may require those features elsewhere.",
      },
      { type: "heading", text: "What each level does" },
      {
        type: "list",
        items: [
          "O0: no optional IR passes. LLVM still lowers instructions into machine code.",
          "O1: local promotion and scalar simplification.",
          "O2: the standard pipeline, including loop and SLP vectorisation. This is the default.",
          "O3: more aggressive standard transformations. Faster is not guaranteed.",
        ],
      },
      {
        type: "code",
        language: "sh",
        filename: "terminal",
        code: `cheeku examples/numerical.chuchu -O3 \\
  --emit-ir numerical.ll \\
  --emit-assembly numerical.s \\
  -o numerical`,
      },
      { type: "heading", text: "The checks do not move" },
      {
        type: "paragraph",
        text: "Checked signed arithmetic, division guards, array bounds and value-copy semantics are part of the production lowering at every level. No unsafe fast-math flags or unjustified nsw/nuw annotations were added. LLVM may still remove a check when it can prove the operation is safe, which is the point of an optimiser.",
      },
      {
        type: "paragraph",
        text: "Every module is verified after generation, before and after passes, and again before object emission. If a pass or target step fails, compilation reports the error; it never quietly drops to a lower optimisation level.",
      },
      {
        type: "quote",
        text: "O3 permits more aggressive standard transformations; it is not guaranteed to be faster or smaller than O2.",
      },
      { type: "heading", text: "Measuring instead of guessing" },
      {
        type: "paragraph",
        text: "--time-compilation prints stage durations as JSON on stderr. --emit-ir and --emit-assembly expose the optimised artifacts for inspection. --no-vectorize turns off the loop and SLP options for experiments, but it is not a promise of scalar machine code: other standard passes can still form vector operations.",
      },
      {
        type: "paragraph",
        text: "The optimisation guide covers the pipeline, the target policy and the library API in detail. If you are comparing levels, build a fresh module for each run rather than reusing one.",
      },
    ],
  },
  {
    slug: "inferred-locals-explicit-functions",
    title: "Why Chuchu infers local types but annotates functions",
    excerpt:
      "Inference should remove noise, not contracts. Locals take their type from the value; function signatures stay written down because callers depend on them.",
    date: "2026-10-22",
    category: "Design",
    readingTime: 5,
    author: "Chuchu team",
    tags: ["Type system", "Design", "Inference"],
    blocks: [
      {
        type: "paragraph",
        text: "Chuchu is statically typed, but most local variables never mention a type. The value on the right of set already says what the variable is. Repeating it on the left would add a second place to change and a second place to get wrong.",
      },
      {
        type: "code",
        language: "chuchu",
        filename: "inference.chuchu",
        code: `set count to 10
set ratio to 0.5
set ready to true

show count
show ratio
show ready`,
      },
      { type: "heading", text: "Locals follow the value" },
      {
        type: "paragraph",
        text: "An integer literal infers i64, a decimal literal infers f64 and a boolean infers i1. Arrays are homogeneous and fixed-size, so [1, 2, 3] is an integer array and [1.0, 2.0] is a float array. The checker resolves the type once and then holds every reassignment to it.",
      },
      {
        type: "paragraph",
        text: "That means set is a declaration with an inferred type, and reassign is a checked update. Assigning a float to an integer variable is an error, not a silent conversion. The compiler would rather stop than change the meaning of your arithmetic.",
      },
      { type: "heading", text: "Signatures are contracts" },
      {
        type: "paragraph",
        text: "Function parameters and return types are annotated. A signature is the part of a function other code depends on, so it stays visible at the definition and at every call site. It also lets Cheeku collect every function signature before checking any body, which is what makes forward calls, recursion and mutual recursion work.",
      },
      {
        type: "code",
        language: "chuchu",
        filename: "factorial.chuchu",
        code: `function factorial(n: int) -> int {
  if n <= 1 {
    return 1
  } else {
    return n * factorial(n - 1)
  }
}

show factorial(5)`,
      },
      { type: "heading", text: "What inference does not do" },
      {
        type: "list",
        items: [
          "It does not coerce between integers and floats implicitly.",
          "It does not infer function parameter or return types.",
          "It does not make an array hold mixed element types.",
          "It does not defer errors to runtime: the program is checked before LLVM sees it.",
        ],
      },
      {
        type: "paragraph",
        text: "The result is a language that stays quiet where the type is obvious and explicit where the contract matters. The type system chapter of the documentation has the full rules.",
      },
    ],
  },
  {
    slug: "seven-stages-to-an-executable",
    title: "Seven stages from .chuchu source to executable",
    excerpt:
      "A tour of the Cheeku pipeline: lex, parse, resolve, check, lower, optimise and link. Nothing reaches LLVM that has not already passed the type checker.",
    date: "2026-10-15",
    category: "Internals",
    readingTime: 8,
    author: "Chuchu team",
    tags: ["Compiler", "LLVM", "Internals"],
    blocks: [
      {
        type: "paragraph",
        text: "Cheeku is deliberately one pipeline with clear hand-offs. Each stage produces a checked result for the next one, and a failure stops compilation before an executable can be published. This is the whole route from a source file to a native binary.",
      },
      { type: "heading", text: "Lex and parse" },
      {
        type: "paragraph",
        text: "The lexer turns source text into tokens: keywords, literals, symbols and newlines, each carrying the byte span it came from. The parser then builds an abstract syntax tree with precedence-based expressions, blocks, calls and indexing. Spans survive the whole way through, which is why diagnostics can point at the exact source that caused them.",
      },
      { type: "heading", text: "Resolve and check" },
      {
        type: "paragraph",
        text: "A symbol table tracks lexical lookup and scope, so shadowing and forward references resolve the way the source reads. The type checker then infers local types, validates signatures, conditions, arrays, scope and returns, and collects function signatures before checking any body. A program that fails here never reaches code generation.",
      },
      { type: "heading", text: "Lower, optimise and link" },
      {
        type: "paragraph",
        text: "Validated statements are lowered into an LLVM module: i64 integers, f64 floats, i1 booleans and fixed-size numeric arrays. The target triple and data layout are installed, the requested O-level runs, and a native object is emitted. The system Clang linker produces the executable, which is staged beside the destination and renamed only after linking succeeds.",
      },
      {
        type: "code",
        language: "sh",
        filename: "terminal",
        code: `.chuchu source
    ↓  lexer
tokens with byte spans
    ↓  parser
abstract syntax tree
    ↓  type checker + symbol table
validated program
    ↓  typed code generation
LLVM module
    ↓  target configuration + optimisation
host-native object
    ↓  Clang linker
executable`,
      },
      {
        type: "paragraph",
        text: "The pipeline is host-native by design. There is no cross-OS target flag and no JIT: Cheeku compiles and links, then stops. Running the program is a separate step, which keeps compiler timings honest and makes failures easy to reproduce.",
      },
      {
        type: "quote",
        text: "Compilation never runs the generated program. Temporary objects are cleaned up, and the requested output is replaced only after linking succeeds.",
      },
      {
        type: "paragraph",
        text: "The About page has the full stage-by-stage walkthrough, and the compiler repository is the source of truth for the implementation.",
      },
    ],
  },
  {
    slug: "benchmarking-a-young-compiler",
    title: "Benchmarking a young compiler honestly",
    excerpt:
      "Eight workloads, four optimisation levels and three reference languages. The report is useful because it also says what the numbers cannot prove.",
    date: "2026-10-08",
    category: "Performance",
    readingTime: 7,
    author: "Chuchu team",
    tags: ["Benchmarks", "Performance", "Methodology"],
    blocks: [
      {
        type: "paragraph",
        text: "A benchmark is only as useful as the questions it refuses to answer. The Phase 7 performance report measures eight workloads at O0 through O3 against optimised Rust, C and Python references, then spends as much space on methodology and limitations as it does on the table.",
      },
      { type: "heading", text: "Eight workloads, four levels" },
      {
        type: "paragraph",
        text: "The suite covers integer and float loops, function calls, recursion, nested loops, array multiplication, array reduction and array copies. Each Chuchu workload runs at all four levels. Every timed execution validates a checksum, and the full run records seven execution samples per variant with a warmup. Compilation and RSS sampling happen outside the execution timer.",
      },
      {
        type: "code",
        language: "sh",
        filename: "terminal",
        code: `export LLVM_SYS_231_PREFIX="$(brew --prefix llvm)"
cargo build --release
python3 benchmarks/run.py \\
  --cheeku ./target/release/cheeku \\
  --output benchmarks/results/phase7-full.json`,
      },
      { type: "heading", text: "Medians, not best runs" },
      {
        type: "paragraph",
        text: "Results are reported as median and interquartile range in milliseconds per process. That includes process startup and output capture, because that is what a user experiences. The report is explicit that these are process-level comparisons, not isolated kernel throughput or a universal language ranking.",
      },
      {
        type: "quote",
        text: "Ratios are process-level comparisons, not isolated kernel throughput or universal language rankings.",
      },
      { type: "heading", text: "What the numbers do not say" },
      {
        type: "list",
        items: [
          "Python uses arbitrary-precision integers and lists, so its costs are not directly comparable.",
          "The native references use different compilers and flags, documented alongside the results.",
          "A vectorisation probe is included, but it cannot isolate a SIMD speedup from other LLVM transformations.",
          "O3 is not assumed to be faster than O2. The report shows where it is and where it is not.",
        ],
      },
      {
        type: "paragraph",
        text: "The performance page explains how to rerun the suite on your own machine. If a result looks surprising, the raw samples, compiler stages, flags and hashes are all in the report.",
      },
    ],
  },
  {
    slug: "editing-chuchu-in-vs-code",
    title: "Editing Chuchu in VS Code",
    excerpt:
      "Highlighting, snippets, completions and scope-aware navigation work without a compiler. Point the extension at Cheeku when you are ready to build.",
    date: "2026-10-01",
    category: "Tooling",
    readingTime: 4,
    author: "Chuchu team",
    tags: ["VS Code", "Tooling", "Editor"],
    blocks: [
      {
        type: "paragraph",
        text: "The Chuchu Language extension is designed so that editing works on its own. You can open a .chuchu file, read it with proper highlighting and navigate its names before you have built Cheeku at all. The compiler is only needed when you ask for a build.",
      },
      { type: "heading", text: "Editing without a compiler" },
      {
        type: "list",
        items: [
          "Syntax highlighting and snippets for .chuchu files.",
          "Completions, hover documentation and function signatures.",
          "Lexical and delimiter diagnostics as you type.",
          "Outline view for functions and declarations.",
        ],
      },
      { type: "heading", text: "Navigation that understands scope" },
      {
        type: "paragraph",
        text: "Jump to definition and find references understand local scope and shadowed variables, so a name inside a block resolves to the declaration that actually applies there. That is more useful than a plain text search, especially once a function has several short-lived locals.",
      },
      { type: "heading", text: "Build from the editor" },
      {
        type: "paragraph",
        text: "When Cheeku is available, point the extension at the executable. The build commands compile normal or debug programs and surface compiler errors in the Problems panel. Full syntax and type checking happen during a build; the editor's live diagnostics are lexical.",
      },
      {
        type: "code",
        language: "json",
        filename: "settings.json",
        code: `{
  "chuchu.compilerPath": "/path/to/cheeku"
}`,
      },
      {
        type: "paragraph",
        text: "The extension requires VS Code 1.96 or newer and is installed from a VSIX built from its repository. The setup guide walks through building the extension, installing the VSIX and connecting your local Cheeku binary. Native debugging uses a separate debugger extension.",
      },
    ],
  },
  {
    slug: "what-chuchu-does-not-do-yet",
    title: "What Chuchu does not do yet",
    excerpt:
      "A young language is defined as much by its boundaries as its features. Here is the current edge of the implementation, written down plainly.",
    date: "2026-09-24",
    category: "Notes",
    readingTime: 5,
    author: "Chuchu team",
    tags: ["Roadmap", "Language", "Notes"],
    blocks: [
      {
        type: "paragraph",
        text: "Chuchu is in early development. The documentation is the source of truth, and it is more useful when it says what is missing as clearly as what works. These are the current boundaries of the implementation, not a promise about the order they will change.",
      },
      { type: "heading", text: "What is deliberately missing" },
      {
        type: "list",
        items: [
          "No character literals.",
          "No for, break, continue or logical operators.",
          "No imports, user-defined types or file I/O.",
          "Arrays hold 1 to 256 elements and cannot be assigned element by element.",
          "Function annotations cover scalars only.",
          "No JIT and no automatic parallelism.",
          "Host-native only: there is no cross-OS target flag.",
        ],
      },
      { type: "heading", text: "What works today" },
      {
        type: "paragraph",
        text: "Within those limits, the compiler is complete enough to be useful. Inferred locals, typed reassignment, integers, floats, booleans, numeric arrays, arithmetic and comparisons all work. if/else, while, lexical scope and block shadowing are implemented. Functions support typed parameters, return types, forward calls, recursion and mutual recursion. Numerical built-ins cover abs, sqrt, min, max, sum and len.",
      },
      {
        type: "paragraph",
        text: "Cheeku also handles the parts around the language: checked arithmetic, division and array bounds at runtime, native object emission, executable linking, O0 through O3, CPU selection, timing JSON, and IR or assembly output when you ask for it.",
      },
      {
        type: "quote",
        text: "The validated native environment is macOS on Apple Silicon. Linux and Windows builds exist, but the public docs do not yet claim native support for them.",
      },
      { type: "heading", text: "Why say it out loud" },
      {
        type: "paragraph",
        text: "Being explicit about limits makes bug reports better and saves people from planning around features that do not exist. It also makes progress visible: when a boundary moves, the changelog and the docs can say exactly what changed.",
      },
      {
        type: "paragraph",
        text: "If something here blocks you, open an issue with the smallest program that shows the problem. Real use cases are the best input for deciding what comes next.",
      },
    ],
  },
];

/** The featured post is the newest one marked as featured, else the newest post. */
export const FEATURED_POST: BlogPost =
  POSTS.find((post) => post.featured) ?? POSTS[0];

/** Every post except the featured one, in publication order. */
export const OTHER_POSTS: BlogPost[] = POSTS.filter(
  (post) => post.slug !== FEATURED_POST.slug,
);

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((post) => post.slug === slug);
}

/** Previous and next posts around `slug`, in publication order. */
export function getPostNeighbours(slug: string): {
  previous?: BlogPost;
  next?: BlogPost;
} {
  const index = POSTS.findIndex((post) => post.slug === slug);
  if (index === -1) return {};
  return {
    previous: POSTS[index + 1],
    next: POSTS[index - 1],
  };
}

export function formatPostDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
