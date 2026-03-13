export default {
  mounted(el, binding) {
    el.style.opacity = "0";
    el.style.transform = "translateY(40px) scale(0.98)";
    el.style.transition = "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)";

    // Optional delay passed via v-animate="{ delay: 200 }"
    if (binding.value && binding.value.delay) {
      el.style.transitionDelay = `${binding.value.delay}ms`;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.opacity = "1";
            el.style.transform = "translateY(0) scale(1)";
            obs.unobserve(el); // Only animate once
          }
        });
      },
      {
        rootMargin: "0px 0px -50px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(el);
  },
};
