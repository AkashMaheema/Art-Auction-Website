import { useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { Painting, Artist } from "./types";
import { paintings } from "./data/paintings";
import { artists } from "./data/artists";
import { formatCurrency } from "./utils/currency";

// Components
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

// Pages
import { HomePage } from "./pages/HomePage";
import { AuctionsPage } from "./pages/AuctionsPage";
import { ArtistsPage } from "./pages/ArtistsPage";
import { PaintingDetailPage } from "./pages/PaintingDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AdminPage } from "./pages/AdminPage";

// Auth
import { useUser } from "./hooks/useUser";

// Types
import type { Page } from "./types/nav";

const pathToPage = (pathname: string): Page => {
  if (pathname.startsWith("/auctions")) return "auctions";
  if (pathname.startsWith("/artists")) return "artists";
  if (pathname.startsWith("/login")) return "login";
  if (pathname.startsWith("/register")) return "register";
  if (pathname.startsWith("/painting")) return "painting";
  if (pathname.startsWith("/admin")) return "admin";
  return "home";
};

function PaintingRoute({
  isLoggedIn,
  userWatchlist,
  onBack,
  onBid,
  onLogin,
  onToggleWatchlist,
  onSetPriceAlert,
}: {
  isLoggedIn: boolean;
  userWatchlist: number[];
  onBack: () => void;
  onBid: (p: Painting, amount: number) => void;
  onLogin: () => void;
  onToggleWatchlist: (id: number) => void;
  onSetPriceAlert: (id: number, target: number) => void;
}) {
  const { id } = useParams();
  const painting = useMemo(
    () => paintings.find((p) => p.id === Number(id)),
    [id]
  );

  if (!painting) return <Navigate to="/auctions" replace />;

  return (
    <PaintingDetailPage
      painting={painting}
      allPaintings={paintings}
      isLoggedIn={isLoggedIn}
      userWatchlist={userWatchlist}
      onBack={onBack}
      onBid={onBid}
      onLogin={onLogin}
      onToggleWatchlist={onToggleWatchlist}
      onSetPriceAlert={onSetPriceAlert}
    />
  );
}

function App() {
  // local UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userWatchlist, setUserWatchlist] = useState<number[]>([]);

  // router
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage: Page = pathToPage(location.pathname);

  // auth
  const { currentUser, logoutUser, refreshMe } = useUser();
  const isLoggedIn = !!currentUser;
  const userName = currentUser?.name || currentUser?.email?.split("@")[0] || "";

  // header actions
  const setCurrentPage = (page: Page) => {
    if (page === "home") navigate("/");
    else if (page === "painting")
      navigate("/auctions"); // header won't jump into a specific painting
    else navigate(`/${page}`);
  };

  const setIsLoggedIn = (value: boolean) => {
    if (value === false) {
      logoutUser();
      navigate("/");
    }
  };

  // data helpers
  const filteredPaintings = useMemo(() => {
    return paintings.filter((painting) => {
      const matchesSearch =
        painting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        painting.artist.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || painting.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, filterCategory]);

  const featuredPaintings = useMemo(
    () => paintings.filter((p) => p.featured),
    []
  );

  // actions
  const handleBid = (painting: Painting, amount: number) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (amount >= painting.minBid) {
      alert(`Bid placed successfully for ${formatCurrency(amount)}!`);
    } else {
      alert(`Minimum bid is ${formatCurrency(painting.minBid)}`);
    }
  };

  const handleToggleWatchlist = (paintingId: number) => {
    setUserWatchlist((prev) =>
      prev.includes(paintingId)
        ? prev.filter((id) => id !== paintingId)
        : [...prev, paintingId]
    );
  };

  const handleSetPriceAlert = (paintingId: number, targetPrice: number) => {
    alert(
      `Price alert set for painting ${paintingId} at ${formatCurrency(
        targetPrice
      )}`
    );
  };

  const handleViewPainting = (painting: Painting) => {
    navigate(`/painting/${painting.id}`);
  };

  const handlePlaceBid = (painting: Painting) => {
    if (!isLoggedIn) navigate("/login");
    else navigate(`/painting/${painting.id}`);
  };

  const handleViewArtist = (_artist: Artist) => {
    // could navigate to /artists/:id later
  };

  // after successful auth, refresh user and navigate
  const handleLogin = async (_email: string, _password: string) => {
    try {
      await refreshMe();
    } catch {}
    navigate("/");
  };
  const handleRegister = async (
    _name: string,
    _email: string,
    _password: string
  ) => {
    try {
      await refreshMe();
    } catch {}
    navigate("/");
  };

  // admin guard
  const RequireAdmin = ({ children }: { children: JSX.Element }) =>
    currentUser?.role === "Admin" ? children : <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === "admin" ? (
        <Routes>
          <Route path="/admin/*" element={<AdminPage />} />

          <Route path="*" element={<Navigate to="/admin/*" replace />} />
        </Routes>
      ) : (
        <>
          <Header
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isLoggedIn={isLoggedIn}
            userName={userName}
            setIsLoggedIn={setIsLoggedIn}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={(v: boolean) => setMobileMenuOpen(v)}
          />

          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  featuredPaintings={featuredPaintings}
                  artists={artists}
                  onViewPainting={handleViewPainting}
                  onViewArtist={handleViewArtist}
                  onNavigateToAuctions={() => navigate("/auctions")}
                  onNavigateToArtists={() => navigate("/artists")}
                />
              }
            />
            <Route
              path="/auctions"
              element={
                <AuctionsPage
                  paintings={filteredPaintings}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  onViewPainting={handleViewPainting}
                  onPlaceBid={handlePlaceBid}
                />
              }
            />
            <Route
              path="/artists"
              element={
                <ArtistsPage
                  artists={artists}
                  onViewArtist={handleViewArtist}
                />
              }
            />
            <Route
              path="/painting/:id"
              element={
                <PaintingRoute
                  isLoggedIn={isLoggedIn}
                  userWatchlist={userWatchlist}
                  onBack={() => navigate("/auctions")}
                  onBid={handleBid}
                  onLogin={() => navigate("/login")}
                  onToggleWatchlist={handleToggleWatchlist}
                  onSetPriceAlert={handleSetPriceAlert}
                />
              }
            />
            <Route
              path="/login"
              element={
                <LoginPage
                  onLogin={handleLogin}
                  onNavigateToRegister={() => navigate("/register")}
                />
              }
            />
            <Route
              path="/register"
              element={
                <RegisterPage
                  onRegister={handleRegister}
                  onNavigateToLogin={() => navigate("/login")}
                />
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
