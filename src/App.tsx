import React, { useState } from "react";
import maplibregl from "maplibre-gl";
import MapView from "./MapView.tsx";

type SelectedFeature = maplibregl.MapboxGeoJSONFeature | null;

const App: React.FC = () => {
	const [selectedFeature, setSelectedFeature] = useState<SelectedFeature>(null);

	return (
		<div
			style={{
				display: "flex",
				width: "100vw",
				height: "100vh",
				backgroundColor: "#020617",
				color: "#e5e7eb",
				fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
			}}>
			{/* 左：属性パネル */}
			<div
				style={{
					width: "30%",
					minWidth: "260px",
					padding: "12px 16px",
					borderRight: "1px solid #1f2933",
					boxSizing: "border-box",
					overflowY: "auto",
				}}>
				<h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 8 }}>属性情報</h2>

				{selectedFeature ? (
					<div
						style={{
							borderRadius: 12,
							padding: "10px 12px",
							background:
								"linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,64,175,0.35))",
							boxShadow: "0 10px 25px rgba(15,23,42,0.7)",
							fontSize: "0.85rem",
						}}>
						<div style={{ marginBottom: 8, opacity: 0.8 }}>
							<span style={{ fontWeight: 500 }}>レイヤー: </span>
							<code style={{ fontSize: "0.8rem" }}>{selectedFeature.layer?.id}</code>
						</div>
						<hr
							style={{
								border: "none",
								borderTop: "1px solid rgba(148,163,184,0.4)",
								margin: "4px 0 8px",
							}}
						/>
						<div style={{ display: "grid", rowGap: 4 }}>
							{selectedFeature.properties &&
								Object.entries(selectedFeature.properties).map(([key, value]) => (
									<div
										key={key}
										style={{
											display: "flex",
											justifyContent: "space-between",
											gap: 8,
										}}>
										<span
											style={{
												fontSize: "0.8rem",
												color: "#9ca3af",
												whiteSpace: "nowrap",
											}}>
											{key}
										</span>
										<span
											style={{
												fontSize: "0.8rem",
												textAlign: "right",
												wordBreak: "break-all",
												flex: 1,
											}}>
											{String(value)}
										</span>
									</div>
								))}
						</div>
					</div>
				) : (
					<p style={{ fontSize: "0.85rem", opacity: 0.7, lineHeight: 1.5 }}>
						地図上のポイントをクリックすると
						<br />
						ここに属性が表示されます。
					</p>
				)}
			</div>

			{/* 右：地図 */}
			<div style={{ flex: 1 }}>
				<MapView onFeatureClick={setSelectedFeature} />
			</div>
		</div>
	);
};

export default App;
