import { redirect, notFound } from "next/navigation";
import { getUserSession } from "@/hooks/use-session";
import { verifyOrgId } from "@/hooks/use-org-id";
import { fetchFavouritesAction } from "@/actions/favourites/fetch-favourites-action";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import FavouritesList from "@/components/favourites/FavouritesList";

interface FavouritesPageProps {
	params: Promise<{ uuid: string }>;
}

const FavouritesPage = async ({ params }: FavouritesPageProps) => {
	const { error, session } = await getUserSession();

	if (error) {
		redirect(error.getRedirectUrl());
	}

	if (!session) {
		redirect("/auth/login");
	}

	const slug = await params;
	const { error: orgIdError } = await verifyOrgId(session, slug);

	if (orgIdError) {
		notFound();
	}

	const result = await fetchFavouritesAction();
	const favourites = result.success ? result.data : [];

	return (
		<div className="w-screen min-h-screen flex flex-col">
			<div className="min-h-[20vh] w-full bg-gray-100"></div>
			<div className="w-full flex flex-1 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 mt-8">
				<div className="w-full flex flex-col gap-4">
					<div>
						<h1 className="text-2xl font-bold">Favourites</h1>
						<p className="text-sm text-neutral-500 mt-1">
							Quickly reorder your saved orders with the latest prices
						</p>
					</div>
					<div className="bg-orange-50 rounded-xl p-4">
						<FavouritesList initialFavourites={favourites} />
					</div>
				</div>
			</div>
			<DashboardFooter />
		</div>
	);
};

export default FavouritesPage;
