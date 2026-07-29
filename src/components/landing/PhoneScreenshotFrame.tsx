type PhoneScreenshotFrameProps = {
  src: string;
  alt: string;
};

export function PhoneScreenshotFrame({ src, alt }: PhoneScreenshotFrameProps) {
  return (
    <div className="d3-iphone-frame" data-device="iphone-15-pro-max">
      <span className="d3-iphone-action" aria-hidden="true" />
      <span className="d3-iphone-volume is-up" aria-hidden="true" />
      <span className="d3-iphone-volume is-down" aria-hidden="true" />
      <span className="d3-iphone-camera-control" aria-hidden="true" />
      <div className="d3-iphone-screen">
        <img src={src} alt={alt} />
      </div>
    </div>
  );
}
