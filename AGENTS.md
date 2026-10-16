# Project Guidance

## User Preferences

- Futuristic Cyberpunk / DePIN visual style
- Dark background #0b0e14 with neon green and cyan accents
- Rounded corners throughout the interface
- Spanish-language interface copy

## Accepted Requirements

- Conexión de billeteras Solana, BNB y Ethereum con dirección corta visible y estados de botón al conectar
- Balance de Energía SPR por billetera almacenado en el canister
- Recarga de 10 SPR de Energía tras el pago
- Consulta del saldo de energía en tiempo real
- Descuento de 1 SPR al ejecutar una tarea de IA con respuesta de éxito
- Panel central con el Balance de Energía SPR Disponible
- Status Log dinámico de recargas y consumos
- Diseño cyberpunk con fondo #0b0e14, acentos verde neón y azul cian, bordes redondeados

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- With class-based darkMode in tailwind.config.js, a dark-first app must add the dark class to document.documentElement at startup (src/frontend/src/main.tsx); otherwise the light :root tokens render and the .dark block in src/frontend/src/index.css is dead.
- Persisting a demo wallet needs a deterministic address (seeded from the chain id) plus localStorage restore in src/frontend/src/hooks/useWallet.tsx; a random address per connect makes the canister-stored balance unreachable after reload.
- caffeineai-oql 0.8.0 auto-derivation (.toEntity) requires the map VALUE to be a record; a Map<Text, Nat> must use OQL.Entity.manual over .entries() with .payload to promote the key and value as columns.
- caffeineai-inference-client 0.1.0: Config.fromEnv<system>() must be called inside the shared call; ChatCompletionRequest.JSON.init takes { messages; model = "router" }, user turns are #user(ChatCompletionRequestMessageOneOf2.JSON.init({ content = #string(prompt); role = #user })), and resp.choices[0].message.content is ?Text.
- A Motoko mixin file must be a bare top-level mixin (params) { ... }; block; main.mo includes it as include EnergyApi(balances, history) with no dot-access.
- Migration files are self-contained and may import only mo:core, so new stable Map fields must be declared with inline types rather than importing ../types; adding new stable actor fields requires extending the pending migrations/00000000_000000.mo NewActor and initializing them with Map.empty.
- Biome's useSemanticElements rejects role='radio'/'group' on <button>/<div>; use a <fieldset> with <legend className='sr-only'> plus aria-pressed for chip-style selectors.
- The local preflight environment has no platform inference key, so runAiTask is rejected with a tagged 'Local test environment limit [inference]' canister_reject; the AI task success path cannot be verified locally.
