import { useUser } from '@context/user';
import {
	useGetFreeTokenUsage,
	useGetUploadStorageUsage,
} from '@hooks/api/useFreeTierLimit.get';
import { freePlanLimits } from 'data/pricingPlans';
import React from 'react';
import toast from 'react-hot-toast';

const SidebarFooter = () => {
	const { user } = useUser();
	const { data: freeTierToken, isError } = useGetFreeTokenUsage();
	const { data: storageUsage, isError: errorGettingUploadStorageUseage } = useGetUploadStorageUsage();

	if (isError) {
		toast.error("Error fetching user's free tier token usage");
	}

	if (errorGettingUploadStorageUseage) {
		toast.error("Error fetching user's upload storage usage");
	}

	return (
		<div className="absolute bottom-0 flex flex-col items-start w-full">
			{!user?.is_subscribed && (
				<div className="p-4 w-full flex flex-col gap-2 text-muted-foreground">
					<div className="flex flex-col gap-1">
						<div className="flex justify-between text-xs">
							<p>Daily requests used</p>

							<p>
								{freeTierToken > freePlanLimits.dailyFreeToken && (
									<span>⚠️</span>
								)}
								{freeTierToken} / {freePlanLimits.dailyFreeToken}
							</p>
						</div>
					</div>
					<div className="flex flex-col gap-1">
						<div className="flex justify-between text-xs">
							<p>Upload storage used</p>
							<p>
								{storageUsage > freePlanLimits.uploadStorage && <span>⚠️</span>}
								{storageUsage} / {freePlanLimits.uploadStorage} MB
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SidebarFooter;
