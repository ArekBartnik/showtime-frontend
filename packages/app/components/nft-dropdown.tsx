import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { useMyInfo } from "app/hooks/api-hooks";
import { useBlock } from "app/hooks/use-block";
import { useCurrentUserAddress } from "app/hooks/use-current-user-address";
import { useCurrentUserId } from "app/hooks/use-current-user-id";
import { useFeed } from "app/hooks/use-feed";
import { useNFTDetails } from "app/hooks/use-nft-details";
import { useReport } from "app/hooks/use-report";
import { useShareNFT } from "app/hooks/use-share-nft";
import { useUser } from "app/hooks/use-user";
import { SHOWTIME_CONTRACTS } from "app/lib/constants";
import { useNavigateToLogin } from "app/navigation/use-navigate-to";
import { useRouter } from "app/navigation/use-router";
import type { NFT } from "app/types";
import { findListingItemByOwner, isUserAnOwner } from "app/utilities";

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "design-system/dropdown-menu";
import { useIsDarkMode } from "design-system/hooks";
import { MoreHorizontal } from "design-system/icon";

type Props = {
  nftId?: NFT["nft_id"];
};

function NFTDropdown({ nftId }: Props) {
  //#region hooks
  const isDark = useIsDarkMode();
  const userId = useCurrentUserId();
  const { user, isAuthenticated } = useUser();
  const { userAddress } = useCurrentUserAddress();
  const [isOwner, setIsOwner] = useState(false);
  const { report } = useReport();
  const { unfollow, isFollowing } = useMyInfo();
  const { getIsBlocked, toggleBlock } = useBlock();
  const router = useRouter();
  const { refresh } = useFeed("");
  const { data: nft } = useNFTDetails(nftId);
  const shareNFT = useShareNFT();
  const navigateToLogin = useNavigateToLogin();
  //#endregion

  //#region variables
  const hasMatchingListing = findListingItemByOwner(nft, userId);
  const hasOwnership = isUserAnOwner(
    user?.data.profile.wallet_addresses_v2,
    nft?.multiple_owners_list
  );

  // Prevent web3 actions on incorrect contracts caused by environment syncs
  const usableContractAddress = SHOWTIME_CONTRACTS.includes(
    nft?.contract_address
  );

  const isFollowingUser = useMemo(
    () => nft?.owner_id && isFollowing(nft?.creator_id),
    [nft?.creator_id, nft?.owner_id, isFollowing]
  );
  const isBlocked = useMemo(
    () => getIsBlocked(nft?.creator_id),
    [nft?.creator_id, getIsBlocked]
  );
  //#endregion

  //#region effects
  useEffect(() => {
    if (nft?.owner_address) {
      setIsOwner(nft.owner_address.toLowerCase() === userAddress.toLowerCase());
    }
  }, [nft, userAddress]);
  //#endregion

  const openModal = (modal: string) => {
    const as = `/nft/${nft?.chain_name}/${nft?.contract_address}/${nft?.token_id}/${modal}`;

    router.push(
      Platform.select({
        native: as,
        web: {
          pathname: router.pathname,
          query: {
            ...router.query,
            chainName: nft?.chain_name,
            contractAddress: nft?.contract_address,
            tokenId: nft?.token_id,
            [`${modal}Modal`]: true,
          },
        } as any,
      }),
      Platform.select({
        native: as,
        web: router.asPath.startsWith("/nft/") ? as : router.asPath,
      }),
      { shallow: true }
    );
  };

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <MoreHorizontal
          color={isDark ? "#fff" : "#000"}
          width={24}
          height={24}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        loop
        tw="w-60 rounded-2xl bg-white p-2 shadow dark:bg-gray-900"
      >
        <DropdownMenuItem
          onSelect={() => openModal("details")}
          key="details"
          tw="h-8 flex-1 overflow-hidden rounded-sm p-2"
        >
          <DropdownMenuItemTitle tw="font-semibold text-black dark:text-white">
            Details
          </DropdownMenuItemTitle>
        </DropdownMenuItem>

        <DropdownMenuSeparator tw="m-1 h-[1px] bg-gray-200 dark:bg-gray-700" />

        <DropdownMenuItem
          onSelect={() => openModal("activities")}
          key="activities"
          tw="h-8 flex-1 overflow-hidden rounded-sm p-2"
        >
          <DropdownMenuItemTitle tw="font-semibold text-black dark:text-white">
            Activity
          </DropdownMenuItemTitle>
        </DropdownMenuItem>

        <DropdownMenuSeparator tw="m-1 h-[1px] bg-gray-200 dark:bg-gray-700" />

        <DropdownMenuItem
          onSelect={() => shareNFT(nft)}
          key="copy-link"
          tw="h-8 flex-1 overflow-hidden rounded-sm p-2"
        >
          <DropdownMenuItemTitle tw="font-semibold text-black dark:text-white">
            Share
          </DropdownMenuItemTitle>
        </DropdownMenuItem>

        {!isOwner && isFollowingUser && (
          <DropdownMenuSeparator tw="m-1 h-[1px] bg-gray-200 dark:bg-gray-700" />
        )}

        {/* <DropdownMenuItem
          onSelect={() => {}}
          key="refresh-metadata"
          tw="h-8 rounded-sm overflow-hidden flex-1 p-2"
        >
          <DropdownMenuItemTitle tw="font-semibold text-black dark:text-white">
            Refresh Metadata
          </DropdownMenuItemTitle>
        </DropdownMenuItem> */}

        {!isOwner && isFollowingUser && (
          <DropdownMenuItem
            onSelect={async () => {
              if (isAuthenticated) {
                await unfollow(nft?.creator_id);
                refresh();
              } else {
                navigateToLogin();
              }
            }}
            key="unfollow"
            tw="h-8 flex-1 overflow-hidden rounded-sm p-2"
          >
            <DropdownMenuItemTitle tw="font-semibold text-black dark:text-white">
              Unfollow User
            </DropdownMenuItemTitle>
          </DropdownMenuItem>
        )}

        {!isOwner && (
          <DropdownMenuSeparator tw="m-1 h-[1px] bg-gray-200 dark:bg-gray-700" />
        )}

        {!isOwner ? (
          <DropdownMenuItem
            key="block"
            tw="h-8 flex-1 overflow-hidden rounded-sm p-2"
            onSelect={() =>
              toggleBlock({
                isBlocked,
                creatorId: nft?.creator_id,
                name: nft?.creator_name,
              })
            }
          >
            <DropdownMenuItemTitle tw="font-semibold text-black dark:text-white">
              {isBlocked ? "Unblock User" : "Block User"}
            </DropdownMenuItemTitle>
          </DropdownMenuItem>
        ) : null}

        {!isOwner && (
          <DropdownMenuSeparator tw="m-1 h-[1px] bg-gray-200 dark:bg-gray-700" />
        )}

        {!isOwner && (
          <DropdownMenuItem
            onSelect={async () => {
              await report({ nftId: nft?.token_id });
              router.pop();
            }}
            key="report"
            tw="h-8 flex-1 overflow-hidden rounded-sm p-2"
          >
            <DropdownMenuItemTitle tw="font-semibold text-black dark:text-white">
              Report
            </DropdownMenuItemTitle>
          </DropdownMenuItem>
        )}

        {isOwner && (
          <DropdownMenuSeparator tw="m-1 h-[1px] bg-gray-200 dark:bg-gray-700" />
        )}

        {isOwner && (
          <DropdownMenuItem
            onSelect={() => openModal("transfer")}
            key="transfer"
            tw="h-8 flex-1 overflow-hidden rounded-sm p-2"
          >
            <DropdownMenuItemTitle tw="font-semibold text-black dark:text-white">
              Transfer
            </DropdownMenuItemTitle>
          </DropdownMenuItem>
        )}

        {hasOwnership && usableContractAddress && !hasMatchingListing && (
          <DropdownMenuSeparator tw="m-1 h-[1px] bg-gray-200 dark:bg-gray-700" />
        )}

        {hasOwnership && usableContractAddress && !hasMatchingListing && (
          <DropdownMenuItem
            onSelect={() => openModal("list")}
            key="list"
            tw="h-8 flex-1 overflow-hidden rounded-sm p-2"
          >
            <DropdownMenuItemTitle tw="font-semibold text-black dark:text-white">
              List
            </DropdownMenuItemTitle>
          </DropdownMenuItem>
        )}

        {hasOwnership && usableContractAddress && hasMatchingListing && (
          <DropdownMenuSeparator tw="m-1 h-[1px] bg-gray-200 dark:bg-gray-700" />
        )}

        {hasOwnership && usableContractAddress && hasMatchingListing && (
          <DropdownMenuItem
            onSelect={() => openModal("unlist")}
            key="unlist"
            tw="h-8 flex-1 overflow-hidden rounded-sm p-2"
          >
            <DropdownMenuItemTitle tw="font-semibold text-black dark:text-white">
              Unlist
            </DropdownMenuItemTitle>
          </DropdownMenuItem>
        )}

        {isOwner && (
          <DropdownMenuSeparator tw="m-1 h-[1px] bg-gray-200 dark:bg-gray-700" />
        )}

        {isOwner && (
          <DropdownMenuItem
            destructive
            onSelect={() => openModal("delete")}
            key="delete"
            tw="h-8 flex-1 overflow-hidden rounded-sm p-2"
          >
            <DropdownMenuItemTitle tw="font-semibold text-black dark:text-white">
              Delete
            </DropdownMenuItemTitle>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}

export { NFTDropdown };
