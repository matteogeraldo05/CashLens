<script setup>
// BalanceChart: D3 grouped bar chart showing monthly income vs expense.
import { ref, watch, onMounted } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
	data: {
		type: Array,
		required: true,
	},
});

const containerRef = ref(null);

function buildChart() {
	if (!containerRef.value || !props.data.length) return;

	d3.select(containerRef.value).selectAll('*').remove();

	const margin = { top: 20, right: 20, bottom: 40, left: 50 };
	const width  = (containerRef.value.clientWidth || 600) - margin.left - margin.right;
	const height = 300 - margin.top - margin.bottom;

	const svg = d3.select(containerRef.value)
		.append('svg')
		.attr('width', '100%')
		.attr('height', height + margin.top + margin.bottom)
		.attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
		.append('g')
		.attr('transform', `translate(${margin.left},${margin.top})`);

	const months   = props.data.map(d => d.month);
	const subgroups = ['income', 'expense'];
	const color    = d3.scaleOrdinal().domain(subgroups).range(['#3a8c5c', '#e05555']);

	// x axis — months
	const x0 = d3.scaleBand()
		.domain(months)
		.range([0, width])
		.padding(0.3);

	// x axis — income/expense within each month
	const x1 = d3.scaleBand()
		.domain(subgroups)
		.range([0, x0.bandwidth()])
		.padding(0.1);

	// y axis
	const maxVal = d3.max(props.data, d => Math.max(d.income, d.expense));
	const y = d3.scaleLinear()
		.domain([0, maxVal * 1.1])
		.range([height, 0]);

	// gridlines
	svg.append('g')
		.selectAll('line')
		.data(y.ticks(5))
		.join('line')
		.attr('x1', 0)
		.attr('x2', width)
		.attr('y1', d => y(d))
		.attr('y2', d => y(d))
		.attr('stroke', 'rgba(255,255,255,0.06)')
		.attr('stroke-width', 1);

	// x axis
	svg.append('g')
		.attr('transform', `translate(0,${height})`)
		.call(d3.axisBottom(x0).tickSize(0))
		.call(g => g.select('.domain').remove())
		.selectAll('text')
		.attr('fill', '#8aaa8a')
		.attr('font-size', '11px');

	// y axis
	svg.append('g')
		.call(d3.axisLeft(y)
			.ticks(5)
			.tickFormat(d => `$${d >= 1000 ? d / 1000 + 'k' : d}`)
			.tickSize(0)
		)
		.call(g => g.select('.domain').remove())
		.selectAll('text')
		.attr('fill', '#8aaa8a')
		.attr('font-size', '11px');

	// bars
	const monthGroups = svg.append('g')
		.selectAll('g')
		.data(props.data)
		.join('g')
		.attr('transform', d => `translate(${x0(d.month)}, 0)`);

	monthGroups.selectAll('rect')
		.data(d => subgroups.map(key => ({ key, value: d[key] })))
		.join('rect')
		.attr('x', d => x1(d.key))
		.attr('y', d => y(d.value))
		.attr('width', x1.bandwidth())
		.attr('height', d => height - y(d.value))
		.attr('fill', d => color(d.key))
		.attr('rx', 2);
}

onMounted(buildChart);
watch(() => props.data, buildChart, { deep: true });
</script>

<template>
	<div ref="containerRef"></div>
</template>