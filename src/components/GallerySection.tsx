import { useState } from "react";
import gallerySports from "@/assets/gallery-sports.jpg";
import galleryScience from "@/assets/gallery-science.jpg";
import galleryCultural from "@/assets/gallery-cultural.jpg";
import galleryLibrary from "@/assets/gallery-library.jpg";
import galleryGraduation from "@/assets/gallery-graduation.jpg";
import galleryCampus from "@/assets/gallery-campus.jpg";

const photos = [
  { src: gallerySports, alt: "Annual Sports Day", caption: "Annual Sports Day" },
  { src: galleryScience, alt: "Science Fair Exhibition", caption: "Science Fair" },
  { src: galleryCultural, alt: "Cultural Festival Performance", caption: "Cultural Fest" },
  { src: galleryLibrary, alt: "School Library", caption: "Our Library" },
  { src: galleryGraduation, alt: "Graduation Ceremony", caption: "Graduation Day" },
  { src: galleryCampus, alt: "Campus Aerial View", caption: "Our Campus" },
];

const GallerySection = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section id="gallery" className="py-20 bg-muted">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-widest uppercase text-accent mb-2">
            Campus Life
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Photo Gallery
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            A glimpse into the vibrant life at Bright Future Academy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="group relative overflow-hidden rounded-xl aspect-[4/3] cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300 flex items-end">
                <span className="text-white font-semibold text-sm px-4 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {photo.caption}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selected !== null && (
        <div
          className="fixed inset-0 z-[60] bg-foreground/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[selected].src}
              alt={photos[selected].alt}
              className="w-full h-auto rounded-xl shadow-elevated"
            />
            <p className="text-center text-white mt-3 font-heading font-semibold">
              {photos[selected].caption}
            </p>
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-card text-foreground flex items-center justify-center text-lg font-bold shadow-elevated hover:bg-muted transition-colors"
              aria-label="Close"
            >
              ×
            </button>
            {/* Nav arrows */}
            {selected > 0 && (
              <button
                onClick={() => setSelected(selected - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 text-foreground flex items-center justify-center shadow-elevated hover:bg-card transition-colors"
                aria-label="Previous"
              >
                ‹
              </button>
            )}
            {selected < photos.length - 1 && (
              <button
                onClick={() => setSelected(selected + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 text-foreground flex items-center justify-center shadow-elevated hover:bg-card transition-colors"
                aria-label="Next"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
