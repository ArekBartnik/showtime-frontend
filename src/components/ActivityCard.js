import { useContext, useRef } from 'react'
import { ACTIVITY_TYPES, activityIconObjects } from '@/lib/constants'
import { Like, Comment, Sell, Buy, Create, Follow, Transfer } from './ActivityTypes'
import { formatDistanceToNowStrict } from 'date-fns'
import Link from 'next/link'
import AppContext from '@/context/app-context'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import LikeButton from './LikeButton'
import CommentButton from './CommentButton'
import ActivityImages from './ActivityImages'
import mixpanel from 'mixpanel-browser'
import useDetectOutsideClick from '@/hooks/useDetectOutsideClick'
import { truncateWithEllipses } from '@/lib/utilities'

export default function ActivityCard({ act, setItemOpenInModal, setReportModalIsOpen, removeActorFromFeed }) {
	const context = useContext(AppContext)
	const { id, nfts, actor_img_url, actor_name, actor_username, actor_wallet_address, actor_profile_id } = act
	const actor = {
		profile_img_url: actor_img_url,
		name: actor_name,
		username: actor_username,
		wallet_address: actor_wallet_address,
	}
	const single = act.nfts?.length === 1
	let content = null
	const handleOpenModal = index => {
		setItemOpenInModal({ nftGroup: nfts, index })
	}

	const handleUnfollow = async () => {
		// Change myLikes via setMyLikes
		context.setMyFollows(context.myFollows.filter(f => f?.profile_id !== actor_profile_id))
		removeActorFromFeed(actor_profile_id)
		// Post changes to the API
		await fetch(`/api/unfollow_v2/${actor_profile_id}`, {
			method: 'post',
		})
		mixpanel.track('Unfollowed profile from Newsfeed dropdown')
	}

	const { type } = act
	switch (type) {
		case ACTIVITY_TYPES.LIKE:
			content = <Like act={act} />
			break
		case ACTIVITY_TYPES.COMMENT:
			content = <Comment act={act} />
			break
		case ACTIVITY_TYPES.SELL:
			content = <Sell act={act} />
			break
		case ACTIVITY_TYPES.BUY:
			content = <Buy act={act} />
			break
		case ACTIVITY_TYPES.CREATE:
			content = <Create act={act} />
			break
		case ACTIVITY_TYPES.FOLLOW:
			content = <Follow act={act} />
			break
		case ACTIVITY_TYPES.SEND:
		case ACTIVITY_TYPES.RECEIVE:
			content = <Transfer act={act} />
	}
	const dropdownRef = useRef(null)
	const [isActive, setIsActive] = useDetectOutsideClick(dropdownRef, false)

	const onCornerMenuClick = () => setIsActive(!isActive)
	return (
		<div
			className="flex flex-col flex-1 mb-6 pt-4 sm:rounded-lg bg-white shadow-md border-t-2"
			style={{
				borderTopColor: activityIconObjects[type].color,
			}}
		>
			{/* actor data */}
			<div className="border-b border-gray-200 pb-4 px-4">
				<div className="flex flex-row">
					<div className="flex items-center">
						<Link href="/[profile]" as={`/${actor?.username || actor?.wallet_address}`}>
							<a
								className="relative w-max flex-shrink-0"
								onClick={() => {
									mixpanel.track('Activity - Click on user profile')
								}}
							>
								<img src={actor.profile_img_url || 'https://storage.googleapis.com/opensea-static/opensea-profile/4.png'} className="rounded-full mr-2 w-14 h-14  hover:opacity-90 transition-all" />
								<div
									className="absolute bottom-0 right-2 rounded-full h-5 w-5 flex items-center justify-center shadow"
									style={{
										backgroundColor: activityIconObjects[type].color,
									}}
								>
									<FontAwesomeIcon className="w-3 h-3 text-white" icon={activityIconObjects[type].icon} />
								</div>
							</a>
						</Link>
						<div className="flex flex-col flex-1 max-w-full">
							<Link href="/[profile]" as={`/${actor?.username || actor?.wallet_address}`}>
								<a
									onClick={() => {
										mixpanel.track('Activity - Click on user profile')
									}}
								>
									<div className="mr-2 hover:text-stpink text-base -mb-1">{truncateWithEllipses(actor.name, 24)}</div>
								</a>
							</Link>

							{actor.username && (
								<Link href="/[profile]" as={`/${actor?.username || actor?.wallet_address}`}>
									<a
										onClick={() => {
											mixpanel.track('Activity - Click on user profile')
										}}
									>
										<div className="text-gray-400 text-xs mx-px">@{actor.username}</div>
									</a>
								</Link>
							)}
							<div className="text-gray-400 text-xs">
								{formatDistanceToNowStrict(new Date(`${act.timestamp}Z`), {
									addSuffix: true,
								})}
							</div>
						</div>
					</div>
					<div className="flex-grow"></div>
					{context.user && (
						<div>
							<div onClick={onCornerMenuClick} className="text-right text-gray-300 relative">
								<FontAwesomeIcon
									style={{
										height: 20,
										width: 20,
									}}
									icon={faEllipsisH}
									className="hover:text-stpink cursor-pointer"
								/>
								<div ref={dropdownRef} className={`absolute text-black text-center top-4 right-1 bg-white py-2 px-2 shadow-lg rounded-xl transition-all text-md transform z-1 ${isActive ? 'visible opacity-1 translate-y-1' : 'invisible opacity-0'}`}>
									<div className="py-2 px-4 hover:text-stpink rounded-lg cursor-pointer whitespace-nowrap" onClick={handleUnfollow}>
										Unfollow
										{/*actor.username ? `@${actor.username}` : "this user"*/}
									</div>
									<div
										className="py-2 px-4 hover:text-stpink rounded-lg cursor-pointer whitespace-nowrap"
										onClick={() => {
											setReportModalIsOpen(id)
										}}
									>
										Report
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
			{/* content */}
			<>
				<div className="max-w-full mt-4  px-4 flex flex-row">
					<div>{content}</div>
				</div>

				{nfts ? (
					<>
						<div className="flex mt-4 max-w-full">
							<ActivityImages nfts={nfts} openModal={handleOpenModal} />
						</div>
						{single ? (
							<div className="flex items-center pt-2 ml-4 mb-4">
								<div className="mr-4 text-base mt-2">
									<LikeButton item={nfts[0]} />
								</div>

								<div className="mr-4 text-base mt-2">
									<CommentButton
										item={nfts[0]}
										handleComment={() => {
											setItemOpenInModal({ nftGroup: nfts, index: 0 })
										}}
									/>
								</div>
							</div>
						) : null}
					</>
				) : null}
			</>
		</div>
	)
}
