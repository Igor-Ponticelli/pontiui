# Carousel

**Status:** `[?]` blocked
**Phase:** 11
**Depends on:** Button (navigation controls)
**Blocked by:** **D-15** - hand-rolled scroll-snap or an external engine
**Client component:** yes

## Goal

A horizontally scrollable set of items with navigation controls and indicators. The last
component deliberately, because it is the most complex to make accessible and the least
essential to the library's core value.

## When not to use it

- For important content. Carousels hide most of their content most of the time, and
  engagement with slides after the first is consistently poor.
- For navigation. Users do not find links inside carousels.
- When all items fit on screen. Use a grid.
- For a hero banner with a single message. Just show the message.

This section matters more here than anywhere else in the library: a consumer reaching
for a carousel is often solving the wrong problem, and the documentation should say so.

## Public API (draft, depends on D-15)

| Prop               | Type                       | Default | Description                   |
| ------------------ | -------------------------- | ------- | ----------------------------- |
| `itemsPerView`     | `number \| responsive map` | `1`     | Visible items                 |
| `gap`              | token step                 | `"md"`  | Space between items           |
| `loop`             | `boolean`                  | `false` | Wrap at the ends              |
| `autoplay`         | `boolean`                  | `false` | Advance automatically         |
| `autoplayInterval` | `number`                   | `5000`  | Milliseconds between advances |
| `showControls`     | `boolean`                  | `true`  | Previous and next buttons     |
| `showIndicators`   | `boolean`                  | `true`  | Position dots                 |
| `onIndexChange`    | `(index: number) => void`  | -       | Fires on change               |

Subcomponents: `Carousel.Item`, and possibly `Carousel.Previous`, `Carousel.Next`,
`Carousel.Indicators` for custom placement.

## Variants

None.

## Sizes

None. Dimensions come from the container and `itemsPerView`.

## States

At start, in the middle, at end, transitioning, autoplay paused.

## Behavior

1. Renders items horizontally with the configured number visible.
2. Previous and next controls move by one item and disable at the ends when not looping.
3. Indicators show the current position and jump to a group on activation.
4. Arrow keys move between items when the carousel has focus.
5. Touch swipe and trackpad scroll work natively if scroll-snap is used.
6. Autoplay pauses on hover, on focus within, and when the tab is hidden.
7. Autoplay must be pausable by the user through a visible control. This is a WCAG
   requirement for any content that moves for more than five seconds, not a nice-to-have.
8. Reduced motion disables autoplay entirely and removes transition animation.
9. Responsive `itemsPerView` should be CSS-driven to avoid hydration mismatch.
10. `loop` combined with scroll-snap is genuinely hard. Strongly consider dropping loop
    from 0.1.0.

## Implementation notes

- **Scroll-snap approach:** the browser provides momentum, touch, accessibility and
  keyboard scrolling for free. Position is read from `scrollLeft`, which needs
  throttling. Loop is the weak point.
- **Transform approach:** full control over position and looping, but touch, momentum
  and accessible scrolling must all be reimplemented.
- **External engine:** solves both, at the cost of a runtime dependency for one
  component.
- Whichever is chosen, items must remain reachable by keyboard and not be hidden from
  assistive technology when off-screen, unless properly marked inert.

## Accessibility

- Pattern: [Carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/). Read it in
  full before implementing; this pattern has more requirements than it appears.
- The region has `role="group"` with `aria-roledescription="carousel"` and an accessible
  name.
- Each item has `aria-roledescription="slide"` and a position label.
- Autoplay requires an accessible pause control, and must pause on hover and focus.
- Controls have accessible names and communicate their disabled state.
- Indicators are real buttons with names describing their destination.
- Off-screen items must not be focus traps or silently reachable in a confusing order.
- Reduced motion respected.

## Tokens used

Spacing, radius, `--pui-color-primary` for the active indicator, muted for inactive,
motion duration.

## Tests

Baseline, plus:

- Controls advance and disable correctly at the ends
- Indicators reflect and change position
- Arrow-key navigation works
- Autoplay advances, and pauses on hover and on focus
- Reduced motion disables autoplay
- Correct roles and roledescriptions
- `onIndexChange` fires with the right index

## Documentation

Single item, multiple items, with and without autoplay. Lead the documentation with the
"when not to use it" section rather than burying it.

## Open questions

- **D-15** must be resolved first.
- Drop `loop` from 0.1.0?
- Is autoplay worth supporting at all, given the accessibility burden and how often it
  is misused?
- Vertical orientation: out of scope for 0.1.0.

## Definition of done

Standard checklist, plus:

- [ ] Full WAI-ARIA carousel pattern walked item by item
- [ ] Keyboard and screen reader pass recorded
- [ ] Autoplay pause control verified
