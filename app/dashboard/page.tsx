
import ManageBanners from "./BannerManager";
import RecentActivity from "./RecentActivity";
import StatsCards from "./CardStat";
import Topbar from "./Topbar";
// import ActivitySlider from "./components/ActivitySlider";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-10 border-2">
      

      <Topbar/>
      {/* Stats Section */}
      <StatsCards />

      {/* Recent Activity */}
      {/* <ActivitySlider /> */}

      {/* Manage Banners (Placeholder) */}
      <RecentActivity/>
      <ManageBanners/>
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Manage Banners</h2>
        <div className="h-32 bg-gray-100 flex items-center justify-center rounded-lg">
          <p className="text-gray-500">Banner Manager Coming Soon</p>
        </div>
      </div>
    </div>
  );
}
