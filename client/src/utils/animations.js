export const textDissapearingAnim = () => {
  if (readyToAnimateText) {
    setReadyToAnimateText(false)

    setTextAreaAnimation(
      textAreaTl
        .from(textAreaRef, {
          duration: 0.4,
          x: 1,
          opacity: 0.8,
          ease: 'power1.out',
        })
        .to(textAreaRef, {
          duration: 0.8,
          x: -1,
          opacity: 0,
          ease: 'power1.out',
        })
        .to(textAreaRef, {
          duration: 0.8,
          y: 10,
          opacity: 0.2,
          ease: 'power1.out',
        })
        .to(textAreaRef, {
          duration: 2.8,
          x: -1,
          opacity: 0,
          ease: 'power1.out',
        })
        .play()
    )
    setTimeout(() => {
      setReadyToAnimateText(true)
    }, 6800)
  }
}
