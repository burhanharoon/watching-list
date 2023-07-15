import { Skeleton, Typography, debounce } from "@mui/material";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";
import { reqList } from "../services/watching-api";
import { ListItem } from "./ListItem";

import SearchOffIcon from "@mui/icons-material/SearchOff";

import InfiniteScroll from "react-infinite-scroll-component";
import { IWatching } from "@/database/model";
import { useDebouncedCallback } from "use-debounce";

export default function List() {
  const { search, status, type, sync, createdBy } = useContext(AppContext);

  const [data, setData] = useState<IWatching[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const perPage = 6;
  const [total, setTotal] = useState(perPage);
  const [loading, seLoading] = useState(true);

  useEffect(() => {
    if (!status || !type || !createdBy) return;

    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, type, sync, createdBy]);

  const fetchData = useDebouncedCallback((isInit?: boolean) => {
    let currPage = page + 1;
    seLoading(true);

    if (isInit) {
      setHasMore(true);
      setData([]);
      setPage(1);
      currPage = 1;
    }

    reqList(search, status, type, currPage, perPage, createdBy).then((res) => {
      if (!res.data.length || res.data.length < perPage) setHasMore(false);

      if (isInit) {
        setData(res.data);
      } else {
        setTotal((prev) => prev + perPage);
        setPage((prev) => prev + 1);
        setData((prev) => prev.concat(res.data));
      }

      seLoading(false);
    });
  }, 500);

  const displayList = () => {
    if (!data?.length) {
      return (
        <Paper elevation={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" textAlign={"center"}>
              {loading ? (
                <>
                  <Skeleton animation="wave" />
                  <Skeleton animation="wave" width={"30%"} />
                  <Skeleton animation="wave" width={"70%"} />
                </>
              ) : (
                <>
                  <Box>
                    <SearchOffIcon sx={{ fontSize: "2em" }} />
                  </Box>
                  Not Found
                </>
              )}
            </Typography>
          </Box>
        </Paper>
      );
    } else {
      return (
        <InfiniteScroll
          dataLength={total} //This is important field to render the next data
          next={fetchData}
          hasMore={hasMore}
          loader={
            <p style={{ textAlign: "center" }}>
              <b>Loading...</b>
            </p>
          }
          endMessage={
            <p style={{ textAlign: "center" }}>
              <b>Yay! You have seen it all</b>
            </p>
          }
        >
          <Stack spacing={2}>
            {data.map((value) => (
              <Paper elevation={2} key={value._id}>
                <ListItem data={value} />
              </Paper>
            ))}
          </Stack>
        </InfiniteScroll>
      );
    }
  };

  if (!createdBy) return null;

  return <>{displayList()}</>;
}