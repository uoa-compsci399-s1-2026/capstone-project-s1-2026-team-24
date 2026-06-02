interface ContactMapProps {
  mapUrl?: string;
}

export default function ContactMap({
  mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3191.62085243865!2d174.74999331301763!3d-36.87549318088687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6d0d4771e23b727d%3A0x90ba816391e739dc!2sHuman%20Nutrition%20Unit!5e0!3m2!1sen!2snz!4v1777374580042!5m2!1sen!2snz",
}: ContactMapProps = {}) {
  return (
    <section className="relative w-full overflow-hidden rounded-[30px]">
        <iframe
          src={mapUrl}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Human Nutrition Unit location"
        />
    </section>
  );
}
