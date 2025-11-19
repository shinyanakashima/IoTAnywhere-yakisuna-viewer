import React, { useEffect, useRef } from "react";
import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
import { Protocol } from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";

type MapViewProps = {
	onFeatureClick?: (feature: maplibregl.MapboxGeoJSONFeature | null) => void;
};

const MapView: React.FC<MapViewProps> = ({ onFeatureClick }) => {
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<MapLibreMap | null>(null);

	useEffect(() => {
		if (!mapContainerRef.current) return;

		const protocol = new Protocol();
		maplibregl.addProtocol("pmtiles", protocol.tile);

		const pmtilesHttpUrl = new URL(
			`${import.meta.env.BASE_URL}yakisuna.pmtiles`,
			window.location.origin
		).toString();
		console.log("pmtilesHttpUrl:", pmtilesHttpUrl);

		const baseCirclePaint: maplibregl.CirclePaint = {
			"circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 3, 12, 6, 16, 10],
			"circle-blur": 0.15,
			"circle-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0.6, 12, 0.85],
			"circle-stroke-color": "#020617",
			"circle-stroke-width": 1.2,
		};

		const map = new maplibregl.Map({
			container: mapContainerRef.current,
			style: {
				version: 8,
				sources: {
					"gsi-std": {
						type: "raster",
						tiles: ["https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"],
						tileSize: 256,
						attribution: "地理院タイル（標準地図）",
						minzoom: 2,
						maxzoom: 18,
					},
					"gsi-vector": {
						type: "vector",
						tiles: [
							"https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf",
						],
						minzoom: 4,
						maxzoom: 16,
					},
					yakisuna: {
						type: "vector",
						url: `pmtiles://${pmtilesHttpUrl}`,
					},
				},
				layers: [
					{
						id: "gsi-std-layer",
						type: "raster",
						source: "gsi-std",
						paint: {
							"raster-brightness-min": 0.0,
							"raster-brightness-max": 0.4,
							"raster-saturation": -1.0,
							"raster-contrast": -0.2,
						},
					},
					{
						id: "eniwa-circle",
						type: "circle",
						source: "yakisuna",
						"source-layer": "eniwa",
						paint: {
							...baseCirclePaint,
							"circle-color": "#22c55e",
						},
					},
					{
						id: "muroran-circle",
						type: "circle",
						source: "yakisuna",
						"source-layer": "muroran",
						paint: {
							...baseCirclePaint,
							"circle-color": "#38bdf8",
						},
					},
					{
						id: "sapporo-circle",
						type: "circle",
						source: "yakisuna",
						"source-layer": "sapporo",
						paint: {
							...baseCirclePaint,
							"circle-color": "#e879f9",
						},
					},
				],
			},
			center: [141.354046, 43.059231],
			zoom: 10,
		});

		mapRef.current = map;

		map.on("load", () => {
			console.log("Map loaded");
			map.fitBounds(
				[
					[140.923403, 42.303748],
					[141.62192, 43.167934],
				],
				{ padding: 40 }
			);
		});

		const clickLayers = ["eniwa-circle", "muroran-circle", "sapporo-circle"];

		const handleClick = (
			e: maplibregl.MapMouseEvent & {
				features?: maplibregl.MapboxGeoJSONFeature[];
			}
		) => {
			if (!onFeatureClick) return;
			const feature = e.features && e.features[0];
			if (feature) {
				onFeatureClick(feature);
			}
		};

		clickLayers.forEach((layerId) => {
			map.on("click", layerId, handleClick);
			// hover のときの cursor は残しておくと操作感が良い
			map.on("mouseenter", layerId, () => {
				map.getCanvas().style.cursor = "pointer";
			});
			map.on("mouseleave", layerId, () => {
				map.getCanvas().style.cursor = "";
			});
		});

		map.on("error", (e) => {
			console.error("Map error:", e.error);
		});

		return () => {
			clickLayers.forEach((layerId) => {
				map.off("click", layerId, handleClick);
				map.off("mouseenter", layerId, () => {});
				map.off("mouseleave", layerId, () => {});
			});
			map.remove();
			maplibregl.removeProtocol("pmtiles");
		};
	}, [onFeatureClick]);

	return (
		<div
			ref={mapContainerRef}
			style={{
				width: "100%",
				height: "100%",
				minHeight: "400px",
			}}
		/>
	);
};

export default MapView;
