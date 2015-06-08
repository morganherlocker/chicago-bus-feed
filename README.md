# chicago-train-feed

Aggregate data from the [Chicago realtime train feed](http://www.transitchicago.com/assets/1/developer_center/cta_Train_Tracker_API_documentation_v1_42.pdf)
##install

```
git clone git@github.com:morganherlocker/chicago-train-feed.git
cd chicago-train-feed
npm install
```

Create a file called `key.json` containing your API key.

```json
{
  "key": "9a9a0516a9d044b5a0e43014ae43756f"
}
```

##run

```
node index.js
```

This will create hourly geojson files with aggregated route data in `./out`.
