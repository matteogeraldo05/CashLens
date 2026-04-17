<script setup>
// PieChart: D3 donut chart with arc tweening and category legend.
import { ref, watch, onMounted, computed } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
	data: {
		type: Array,
		required: true,
	},
});



const containerRef = ref(null);
const colors = [
    '#1A6B45',
    '#757874',
    '#5E7E70',
    '#2d8a5a',
    '#4a9e78',
    '#8a9e94',
    '#3d6b58',
    '#9aafa6',
];

function buildChart() {
	if (!containerRef.value || !props.data.length) return;

	d3.select(containerRef.value).selectAll('*').remove();

	const width       = containerRef.value.clientWidth || 400;
	const height      = Math.min(255, width / 2);
	const outerRadius = height / 2 - 10;
	const innerRadius = outerRadius * 0.75;
	const color = d3.scaleOrdinal(colors);

	const svg = d3.create('svg')
		.attr('viewBox', [-width / 2, -height / 2, width, height])
		.attr('width', '100%')
		.attr('height', height);

	const arc = d3.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius);

	const pie = d3.pie()
		.sort(null)
		.value(d => d.amount);

	const path = svg.datum(props.data).selectAll('path')
		.data(pie)
		.join('path')
		.attr('fill', (d, i) => color(i))
		.attr('d', arc)
		.each(function(d) { this._current = d; });

	function arcTween(a) {
		const i = d3.interpolate(this._current, a);
		this._current = i(0);
		return (t) => arc(i(t));
	}

	function change(value) {
		pie.value(d => d[value]);
		path.data(pie);
		path.transition().duration(750).attrTween('d', arcTween);
	}

	containerRef.value.appendChild(Object.assign(svg.node(), { change }));
}

const total = computed(() =>
	props.data.reduce((s, d) => s + Number(d.amount), 0)
);

onMounted(buildChart);
watch(() => props.data, buildChart, { deep: true });
</script>

<template>
	<div>
		<div ref="containerRef"></div>
		<div class="legend">
			<div v-for="(item, i) in data" :key="item.name" class="legend-item">
				<span class="legend-swatch" :style="{ background: colors[i % colors.length] }"></span>
				<span class="legend-name">{{ item.name }}</span>
				<span class="legend-pct">{{ item.pct }}%</span>
			</div>
		</div>
	</div>
</template>

<style scoped>
.legend {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-top: 12px;
}

.legend-item {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
}

.legend-swatch {
	width: 10px;
	height: 10px;
	border-radius: 2px;
	flex-shrink: 0;
}

.legend-name {
	flex: 1;
}

.legend-pct {
	font-weight: 600;
	min-width: 36px;
	text-align: right;
}
</style>