// Read-only browser observations; no event dispatch or application mutation.
export function observeNavigation() {
  const rect = element => element?.getBoundingClientRect().toJSON() || null;
  const focused = document.activeElement;
  const surface = document.querySelector('.menu-drop, .bubble-password, .pp-archive-choice-overlay, .wt-nav-page, .wt-case-study-page, .playground-overlay, .pp-active');
  const menu = document.querySelector('.menu-drop');
  const extraBack = document.querySelector('.pp-home-btn');
  const logo = document.querySelector('.pp-logo');
  const collapsedLinks = [...document.querySelectorAll('.header__menu-box .nav-link-btn')];
  const controls = [...document.querySelectorAll('.wt-site-header__logo,.header__more-btn,.wt-header-theme-trigger,.pp-home-btn,.pp-back-btn,.wt-case-back')];
  return {
    compact: Boolean(document.querySelector('.wt-mobile-preview')),
    viewport: { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight },
    documentScrollWidth: document.documentElement.scrollWidth,
    focus: focused ? { tag: focused.tagName, text: focused.textContent?.trim().slice(0, 120), label: focused.getAttribute('aria-label'), id: focused.id, withinSurface: Boolean(surface?.contains(focused)) } : null,
    collapsedLinks: collapsedLinks.map(element => ({ text: element.textContent.trim(), tabIndex: element.tabIndex, inert: Boolean(element.closest('[inert]')), rect: rect(element) })),
    controls: controls.map(element => ({ label: element.getAttribute('aria-label') || element.textContent.trim(), rect: rect(element), minHeight: getComputedStyle(element).minHeight, extraTouchTop: getComputedStyle(element, '::after').top })),
    menu: menu ? { scrollTop: menu.scrollTop, scrollHeight: menu.scrollHeight, clientHeight: menu.clientHeight, overflowY: getComputedStyle(menu).overflowY, headerInert: Boolean(document.querySelector('header')?.closest('[inert]')) } : null,
    mainContentInert: Boolean(document.querySelector('.wt-scroll-content')?.closest('[inert]')),
    contactFonts: [...document.querySelectorAll('.wt-contact-page__field input,.wt-contact-page__field textarea')].map(element => +getComputedStyle(element).fontSize.replace('px', '')),
    extras: extraBack && logo ? { back: rect(extraBack), logo: rect(logo), menuScrollHeight: document.querySelector('.pp-menu-area')?.scrollHeight, menuHeight: document.querySelector('.pp-menu-area')?.clientHeight } : null,
    password: document.querySelector('.bubble-password') ? { fontSize: getComputedStyle(document.querySelector('.bubble-password__input')).fontSize, scrollHeight: document.querySelector('.bubble-password').scrollHeight, clientHeight: document.querySelector('.bubble-password').clientHeight } : null,
  };
}
