import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { bannerService } from "../../services/bannerService";
import type { Banner } from "../../services/bannerService";

export function BannerCarousel() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Static fallback banners
  const fallbackBanners: Banner[] = [
    {
      id: 1,
      title: "Fresh Vegetables Direct from Farmers",
      subtitle: "Up to 20% OFF",
      imageUrl:
        "https://images.unsplash.com/photo-1488615689569-7522a3b5f57b?w=1200&h=500&fit=crop",
      buttonText: "Shop Now",
      redirectUrl: "/products",
      isActive: true,
    },
    {
      id: 2,
      title: "Support Local Farmers",
      subtitle: "Best Quality Guaranteed",
      imageUrl:
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=500&fit=crop",
      buttonText: "Explore",
      redirectUrl: "/products",
      isActive: true,
    },
    {
      id: 3,
      title: "Organic & Sustainable Farming",
      subtitle: "100% Chemical Free Products",
      imageUrl:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1200&h=500&fit=crop",
      buttonText: "Discover More",
      redirectUrl: "/products",
      isActive: true,
    },
  ];

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await bannerService.getActiveBanners();
        if (response && response.length > 0) {
          setBanners(response);
        } else {
          // Fallback to static banners if API returns empty
          setBanners(fallbackBanners);
        }
      } catch (err) {
        console.error("Failed to fetch banners:", err);
        setError(err instanceof Error ? err.message : "Failed to load banners");
        // Use fallback banners on error
        setBanners(fallbackBanners);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const displayBanners = banners.length > 0 ? banners : fallbackBanners;

  return (
    <div className="w-full h-[480px] md:h-[600px] overflow-hidden">
      {loading && (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {error && !loading && (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <p className="text-slate-600 dark:text-slate-300">
            Failed to load banners. Using default content.
          </p>
        </div>
      )}

      {!loading && (
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          navigation={true}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="w-full h-full"
        >
          {displayBanners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className="relative w-full h-full group">
                {/* Banner Image with Lazy Loading */}
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 md:px-8 z-10">
                  <div className="max-w-2xl space-y-4">
                    {/* Subtitle */}
                    <p className="text-sm md:text-lg font-semibold text-green-300 opacity-90 uppercase tracking-widest">
                      {banner.subtitle}
                    </p>

                    {/* Title */}
                    <h2 className="text-2xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
                      {banner.title}
                    </h2>

                    {/* CTA Button */}
                    <button
                      onClick={() => navigate(banner.redirectUrl)}
                      className="mt-6 inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      {banner.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Custom Swiper Styles */}
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white;
          background-color: rgba(0, 0, 0, 0.4);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }

        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 18px;
          font-weight: bold;
        }

        .swiper-pagination-bullet {
          background-color: white;
          opacity: 0.6;
          transition: all 0.3s ease;
        }

        .swiper-pagination-bullet-active {
          background-color: white;
          opacity: 1;
          width: 32px;
          border-radius: 4px;
        }

        .swiper-pagination {
          bottom: 20px;
          z-index: 20;
        }

        @media (max-width: 768px) {
          .swiper-button-next,
          .swiper-button-prev {
            width: 36px;
            height: 36px;
          }

          .swiper-button-next::after,
          .swiper-button-prev::after {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}
