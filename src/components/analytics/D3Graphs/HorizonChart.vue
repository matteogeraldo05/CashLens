<script setup>
// HorizonChart: D3 line chart showing historical net with a projected forecast band.
import { ref, watch, onMounted } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
	data: {
		type: Array,
		required: true,
	},
	forecast: {
		type: Object,
		required: true,
	},
});

const containerRef = ref(null);

function buildChart() {
	if (!containerRef.value || !props.data.length || !props.forecast) return;

	d3.select(containerRef.value).selectAll('*').remove();

	const margin = { top: 20, right: 40, bottom: 40, left: 60 };
	const width  = (containerRef.value.clientWidth || 600) - margin.left - margin.right;
	const height = 260 - margin.top - margin.bottom;

	const svg = d3.select(containerRef.value)
		.append('svg')
		.attr('width', '100%')
		.attr('height', height + margin.top + margin.bottom)
		.attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
		.append('g')
		.attr('transform', `translate(${margin.left},${margin.top})`);

	// build combined dataset: historical + forecast point
	const historical = props.data.map((d, i) => ({ index: i, value: d.net, label: d.month, forecast: false }));
	const lastIndex  = historical.length - 1;
	const lastValue  = historical[lastIndex].value;

	// forecast band: ±20% around projected net
	const projected = props.forecast[props.forecast.length - 1].projectedNet;
	const upper      = Math.round(projected * 1.2);
	const lower      = Math.round(projected * 0.8);

	const forecastPoint = { index: lastIndex + 1, value: projected, label: props.forecast.label, forecast: true };
	const allPoints     = [...historical, forecastPoint];

	// scales
	const allValues = allPoints.map(d => d.value).concat([upper, lower]);
	const x = d3.scaleLinear().domain([0, allPoints.length - 1]).range([0, width]);
	const y = d3.scaleLinear().domain([d3.min(allValues) * 1.1, d3.max(allValues) * 1.1]).range([height, 0]);

	// gridlines
	svg.append('g')
		.selectAll('line')
		.data(y.ticks(4))
		.join('line')
		.attr('x1', 0).attr('x2', width)
		.attr('y1', d => y(d)).attr('y2', d => y(d))
		.attr('stroke', 'rgba(255,255,255,0.05)')
		.attr('stroke-width', 1);

	// x axis labels
	svg.append('g')
		.attr('transform', `translate(0,${height})`)
		.call(
			d3.axisBottom(x)
				.ticks(allPoints.length)
				.tickFormat(i => allPoints[Math.round(i)]?.label || '')
				.tickSize(0)
		)
		.call(g => g.select('.domain').remove())
		.selectAll('text')
		.attr('fill', '#8aaa8a')
		.attr('font-size', '11px')
		.attr('dy', '1.5em');

	// y axis
	svg.append('g')
		.call(
			d3.axisLeft(y)
				.ticks(4)
				.tickFormat(d => `$${d >= 1000 ? (d / 1000).toFixed(1) + 'k' : d}`)
				.tickSize(0)
		)
		.call(g => g.select('.domain').remove())
		.selectAll('text')
		.attr('fill', '#8aaa8a')
		.attr('font-size', '11px');

	// forecast band area
	const bandData = [
		{ index: lastIndex,     upper: lastValue, lower: lastValue },
		{ index: lastIndex + 1, upper: upper,     lower: lower     },
	];

	const area = d3.area()
		.x(d => x(d.index))
		.y0(d => y(d.lower))
		.y1(d => y(d.upper))
		.curve(d3.curveCatmullRom);

	svg.append('path')
		.datum(bandData)
		.attr('d', area)
		.attr('fill', 'rgba(58,140,92,0.25)');

	// forecast upper/lower dashed bounds
	const dashedLine = d3.line().x(d => x(d.index)).y(d => y(d.value)).curve(d3.curveCatmullRom);

	svg.append('path')
		.datum([{ index: lastIndex, value: lastValue }, { index: lastIndex + 1, value: upper }])
		.attr('d', dashedLine)
		.attr('fill', 'none')
		.attr('stroke', 'rgba(82,196,132,0.3)')
		.attr('stroke-width', 1)
		.attr('stroke-dasharray', '3 3');

	svg.append('path')
		.datum([{ index: lastIndex, value: lastValue }, { index: lastIndex + 1, value: lower }])
		.attr('d', dashedLine)
		.attr('fill', 'none')
		.attr('stroke', 'rgba(82,196,132,0.3)')
		.attr('stroke-width', 1)
		.attr('stroke-dasharray', '3 3');

	// historical line
	const line = d3.line().x(d => x(d.index)).y(d => y(d.value)).curve(d3.curveCatmullRom);

	svg.append('path')
		.datum(historical)
		.attr('d', line)
		.attr('fill', 'none')
		.attr('stroke', '#ffffff')
		.attr('stroke-width', 2)
		.attr('stroke-linecap', 'round');

	// forecast dashed line
	svg.append('path')
		.datum([historical[lastIndex], forecastPoint])
		.attr('d', line)
		.attr('fill', 'none')
		.attr('stroke', '#52c484')
		.attr('stroke-width', 2)
		.attr('stroke-dasharray', '5 4')
		.attr('stroke-linecap', 'round');

	// vertical divider
	svg.append('line')
		.attr('x1', x(lastIndex)).attr('x2', x(lastIndex))
		.attr('y1', 0).attr('y2', height)
		.attr('stroke', 'rgba(255,255,255,0.15)')
		.attr('stroke-dasharray', '4 4');

	// junction dot
	svg.append('circle')
		.attr('cx', x(lastIndex))
		.attr('cy', y(lastValue))
		.attr('r', 5)
		.attr('fill', '#ffffff')
		.attr('stroke', '#0f110f')
		.attr('stroke-width', 2);

	// forecast label
	svg.append('text')
		.attr('x', x(lastIndex + 1))
		.attr('y', y(projected) - 12)
		.attr('text-anchor', 'middle')
		.attr('fill', '#52c484')
		.attr('font-size', '11px')
		.text(`$${projected.toLocaleString()}`);
}

onMounted(buildChart);
watch(() => [props.data, props.forecast], buildChart, { deep: true });
</script>

<template>
	<div ref="containerRef"></div>
</template>