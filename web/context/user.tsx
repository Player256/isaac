import { SignInWithPasswordCredentials, User } from '@supabase/supabase-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@utils/supabase';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CustomInstructions = {
	instructions: string;
	responseInstructions: string;
};

export type Profile = {
	is_subscribed: boolean;
	stripe_customer: string;
	first_name: string | null;
	last_name: string | null;
	has_seen_tour: boolean;
	has_seen_latest_update: boolean;
	interval: string | null;
	email: string;
	username: string;
	daily_free_token: number;
	has_seen_community_banner: boolean;
	custom_instructions: CustomInstructions | null;
	editor_language: string;
};

const Context = createContext<{
	user: User & Partial<Profile>;
	userIsLoading: boolean;
	setUser?: (user: User & Partial<Profile>) => void;
	login?: (data: any) => Promise<any>;
	logout?: () => void;
	loginWithGoogle?: () => Promise<any>;
}>({
	user: undefined,
	userIsLoading: false,
});

const fetchUserProfile = async userId => {
	const { data: profile } = await supabase
		.from('profile')
		.select('*')
		.eq('id', userId)
		.single();
	return profile;
};

const UserProvider = ({ children }) => {
	const router = useRouter();
	const queryClient = useQueryClient();

	const [sessionUser, setSessionUser] = useState(null);

	useEffect(() => {
		const loadSession = async () => {
			const { data, error } = await supabase.auth.getSession();
			if (error) console.error(error);
			else setSessionUser(data.session?.user);
		};
		void loadSession();
	}, []);

	const { data: userProfile, isLoading } = useQuery({
		queryKey: ['fetch-user-profile', sessionUser?.id],
		queryFn: () => fetchUserProfile(sessionUser?.id),
		enabled: !!sessionUser,
	});

	const logoutMutation = useMutation({
		mutationFn: () => supabase.auth.signOut(),
		onSuccess: () => {
			setSessionUser(null);
			queryClient.invalidateQueries({ queryKey: ['fetch-user-profile'] });
			router.push('/');
		},
	});

	const login = async (credentials: SignInWithPasswordCredentials) => {
		const result = await supabase.auth.signInWithPassword(credentials);
		if (result.data.user) setSessionUser(result.data.user);
		return result;
	};

	const exposed = useMemo(
		() => ({
			user: userProfile
				? {
						...sessionUser,
						...userProfile,
						username: sessionUser?.email.split('@')[0],
				  }
				: undefined,
			userIsLoading: isLoading,
			setUser: newData =>
				queryClient.setQueryData(['userProfile', sessionUser?.id], newData),
			login,
			logout: () => logoutMutation.mutate(),
			loginWithGoogle: async () => {
				return await supabase.auth.signInWithOAuth({
					provider: 'google',
					options: {
						redirectTo: `${location.origin}/api/auth/callback`,
					},
				});
			},
		}),
		[userProfile, sessionUser, isLoading],
	);

	return <Context.Provider value={exposed}>{children}</Context.Provider>;
};

export const useUser = () => useContext(Context);

export default UserProvider;
