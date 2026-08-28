import tblLogo from "@/assets/friends/tbl.svg";
import geniusLogo from "@/assets/friends/genius-network.png";
import hydrationLogo from "@/assets/friends/dept-hydration.png";
import mbaLogo from "@/assets/friends/mba.png";
import meteorLogo from "@/assets/friends/meteor17.gif";

const FRIENDS = [
  { name: "Team Boxing League", logo: tblLogo, url: "https://www.teamboxingleague.com/", h: "h-10 md:h-16" },
  { name: "The Genius Network", logo: geniusLogo, url: "https://geniusnetwork.com/", h: "h-8 md:h-12" },
  { name: "Department of Hydration", logo: hydrationLogo, url: "https://deptofhydration.us/", h: "h-5 md:h-7" },
  { name: "Military Basketball Association", logo: mbaLogo, url: "https://www.mymbaglobal.com/", h: "h-10 md:h-16" },
  { name: "Meteor 17", logo: meteorLogo, url: "https://www.meteor17.com/", h: "h-7 md:h-10" },
];

export const FriendsOf = () => {
  // Two copies back-to-back; translating -50% loops seamlessly
  const loop = [...FRIENDS, ...FRIENDS];

  return (
    <section className="relative bg-background py-10 md:py-16 overflow-hidden border-t border-border/40">
      <style>{`
        @keyframes friends-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-7 md:mb-10">
        Friends of <span className="text-primary">VPA</span>
      </p>

      {/* Edge fades */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        <div
          className="flex w-max items-center motion-reduce:animate-none"
          style={{ animation: "friends-marquee 35s linear infinite" }}
        >
          {loop.map((friend, i) => (
            <a
              key={`${friend.name}-${i}`}
              href={friend.url}
              target="_blank"
              rel="noopener noreferrer"
              title={friend.name}
              aria-hidden={i >= FRIENDS.length}
              tabIndex={i >= FRIENDS.length ? -1 : undefined}
              className="shrink-0 mx-6 md:mx-10 opacity-75 hover:opacity-100 transition-opacity duration-300"
            >
              <img
                src={friend.logo}
                alt={friend.name}
                className={`${friend.h} w-auto object-contain`}
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
