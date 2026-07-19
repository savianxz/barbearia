# MASTER.md — Design System
## Barbearia Premium (Dark Gold)

> Fonte de verdade para todas as decisões visuais do projeto.
> Gerado via skill `ui-ux-pro-max` · Atualizado 2026-07-19

---

## 1. Identidade Visual

| Atributo | Decisão |
|---|---|
| **Estilo** | Dark Luxury · Minimalismo Premium |
| **Mood** | Confiança artesanal, precisão, pertencimento masculino |
| **Anti-patterns** | Glassmorphism excessivo, neon, gradientes vibrantes, emojis como ícones |
| **Referências** | Barbearias de alto padrão, editorial GQ, relógios de luxo |

---

## 2. Paleta de Cores (Tokens)

```css
/* Backgrounds */
--bg-dark:        #090909;   /* fundo principal */
--bg-dark-2:      #111111;   /* cards, seções alternadas */
--bg-dark-3:      #1a1a1a;   /* inputs, modais */

/* Gold (accent primário) */
--gold:           #D4AF37;
--gold-hover:     #F3D66E;
--gold-muted:     rgba(212,175,55,0.15);

/* Texto */
--text-primary:   #FFFFFF;
--text-secondary: rgba(255,255,255,0.55);
--text-muted:     rgba(255,255,255,0.30);

/* Bordas */
--border-premium: rgba(255,255,255,0.08);
--border-gold:    rgba(212,175,55,0.30);

/* Neutros de apoio */
--neutral-850:    #1C1C1C;
```

### Regras de uso
- **Nunca** usar hex bruto em componentes — sempre via variável CSS ou classe Tailwind mapeada
- Gold como accent de ação, destaque e hover — **nunca** como cor de fundo de área grande
- Texto secundário mínimo: `rgba(255,255,255,0.55)` — não descer abaixo para manter contraste 4.5:1

---

## 3. Tipografia

| Papel | Família | Peso | Uso |
|---|---|---|---|
| **Display / Heading** | Cinzel | 400–700 | Títulos, hero h1, logo |
| **Body / UI** | Geist | 300–700 | Parágrafos, labels, botões |

### Escala de tamanhos (mobile-first)

| Token | Mobile | Desktop | Uso |
|---|---|---|---|
| `display-xl` | 2.1rem | 4.5rem (7xl) | Hero H1 |
| `display-lg` | 1.5rem | 2.25rem (4xl) | Títulos de seção |
| `display-md` | 1.25rem | 1.5rem | Cards de destaque |
| `body-lg` | 1rem | 1.125rem | Subtítulos, leads |
| `body-base` | 0.875rem | 1rem | Parágrafos |
| `label` | 0.75rem | 0.75rem | Badges, labels |
| `micro` | 0.5625rem | 0.625rem | Tracking-widest caps |

### Regras
- Line-height body: **1.65** (leading-relaxed)
- Letter-spacing títulos: **tracking-tight** a **tracking-widest** conforme hierarquia
- UPPERCASE com `tracking-widest` para badges, botões, labels — nunca para parágrafos longos
- Mínimo 16px body no mobile (evita zoom automático iOS)

---

## 4. Espaçamento (Sistema 4/8px)

```
4px  → gap mínimo entre elementos inline (ícone + texto)
8px  → gap entre elementos relacionados
12px → padding interno de badges e chips
16px → padding interno de cards pequenos / mobile gutters
24px → separação entre grupos de elementos
32px → espaçamento entre seções dentro de uma página
48px → espaçamento entre seções maiores
64px → padding de seções hero / full-width
96px → separação entre seções de página (desktop)
```

### Aplicação no projeto

| Contexto | Valor |
|---|---|
| Navbar: gap entre logo e nav links | `gap-8` (32px) |
| Navbar: gap entre nav links | `gap-10` (40px) |
| Navbar: gap entre botões CTA | `gap-3` (12px) |
| Navbar: padding horizontal | `px-4 sm:px-6 lg:px-8` |
| Hero: padding-bottom mobile | `pb-10` (40px) |
| Hero: padding-bottom desktop | `sm:pb-24` (96px) — clearance para scroll indicator |
| Trust badges: gap horizontal | `gap-6` (24px) |
| Seções: padding vertical | `py-16 md:py-24` |

---

## 5. Componentes

### Navbar
- **Altura:** 60px mobile / 80px desktop
- **Layout:** `flex items-center gap-8` — Logo | Nav Links (flex-1 justify-center) | CTAs (ml-auto)
- **Scroll effect:** `bg-[rgba(9,9,9,0.95)] backdrop-blur-xl border-border-premium` quando `scrollY > 20`
- **Desktop nav links:** `gap-10 flex-1 justify-center` — centralizado entre logo e CTAs
- **CTAs:** `ml-auto flex-shrink-0` — nunca comprime ou some
- **Mobile:** hambúrguer com menu drawer animado (framer-motion)

### Botões
```
Primário:   bg-gold text-bg-dark font-bold uppercase tracking-widest px-8 min-h-[56px]
Secundário: border border-border-premium text-white/80 hover:border-white/40
Ghost:      border border-neutral-850 text-text-secondary hover:border-gold/30
```
- Todos: `cursor-pointer transition-all duration-300`
- Mobile: `min-h-[56px]` (≥44pt touch target)
- Shimmer sweep no hover do primário: `bg-gradient-to-r via-white/15`

### Cards de Stats (Trust badges)
- Layout: `flex flex-col items-center`
- Valor: `text-lg md:text-2xl font-bold text-gold font-display`
- Label: `text-[9px] md:text-[10px] text-text-secondary uppercase tracking-widest`

### Scroll Indicator
- Posição: `absolute bottom-6 left-1/2 -translate-x-1/2 z-20`
- Visibilidade: `hidden sm:flex` — **oculto no mobile**, visível apenas em `sm:` e acima
- Clearance: conteúdo acima deve ter `sm:pb-24` para não colidir

### Badges / Chips
- `border border-gold/30 bg-gold/5 rounded-full px-3 py-1.5`
- Texto: `text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-gold`

---

## 6. Animações

| Uso | Duration | Easing |
|---|---|---|
| Entrada de elementos hero | 0.6–0.8s | `[0.16, 1, 0.3, 1]` (spring-like) |
| Background zoom in hero | 1.4s | `easeOut` |
| Navbar fade in | 0.6s | `[0.16, 1, 0.3, 1]` |
| Hover states | 300ms | CSS `transition-all` |
| Scroll indicator bounce | 2s repeat | `easeInOut` |
| Mobile menu | 0.3s | `ease-out` |

- **Stagger de entrada:** delay crescente de 0.15s por elemento
- Sempre usar `transform` e `opacity` — nunca animar `width`, `height`, `top`, `left`
- Respeitar `prefers-reduced-motion` em futuras implementações

---

## 7. Copy — Tom de Voz

### Princípios
- **Direto:** fala o que é, não o que parece ser
- **Concreto:** ações e resultados reais, não adjetivos vazios
- **Humano:** como um barbeiro experiente falaria, não como anúncio de TV
- **Sem promessas absolutas:** evitar "perfeito", "erro zero", "definitivo"

### Palavras banidas
`sofisticação` · `experiência definitiva` · `puro luxo` · `técnicas cirúrgicas` · `exclusivo` · `reservado para você` · qualquer data de fundação não confirmada

### Exemplos aprovados
| Antes (banido) | Depois (aprovado) |
|---|---|
| "A Experiência Masculina Definitiva" | "Barbearia Artesanal" |
| "técnicas cirúrgicas modernas" | "acabamento feito com cuidado" |
| "ambiente de puro luxo reservado para você" | "sem enrolação, sem espera" |
| "Agendamento expresso em menos de 30 segundos" | "Marque em segundos, chegue no horário" |

---

## 8. Layout e Breakpoints

| Breakpoint | px | Uso |
|---|---|---|
| `sm` | 640px | Oculta/mostra elementos mobile vs desktop |
| `md` | 768px | Navbar desktop, tamanhos de fonte desktop |
| `lg` | 1024px | Padding horizontal aumentado (`lg:px-8`) |
| `xl` | 1280px | Max-width containers (`max-w-7xl`) |

### Regras
- **Mobile-first sempre** — escrever base mobile, sobrescrever com `md:` / `sm:`
- Container principal: `max-w-7xl mx-auto`
- Hero container: `max-w-5xl mx-auto`
- Sem horizontal scroll em nenhum breakpoint
- Touch targets mínimos: `min-h-[56px]` em botões, `44px` em outros interativos

---

## 9. z-index Scale

| Camada | z-index | Uso |
|---|---|---|
| Base content | 0 | Elementos estáticos |
| Background effects | 10 | Gradientes, overlays |
| Content | 20 | Texto, CTAs do hero |
| Navbar | 40 | `z-40` — fixed top |
| Modais | 50 | Booking modal, admin modal |
| Toasts | 60 | Notificações |

---

## 10. Checklist de QA Pré-Deploy

- [ ] Navbar não comprime itens em 1024px
- [ ] Scroll indicator não colide com stats em nenhum viewport height
- [ ] Touch targets >= 44px em todos os botões mobile
- [ ] Contraste texto/fundo >= 4.5:1 em todos os textos body
- [ ] Sem horizontal scroll em mobile (375px)
- [ ] Copy sem palavras banidas (seção 7)
- [ ] Datas de fundação confirmadas antes de usar no copy
- [ ] Animações não bloqueiam interação do usuário
- [ ] Build passa (`npm run build`) sem erros de TypeScript
