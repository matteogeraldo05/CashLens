<script setup>
// BudgetTrend: D3 multi-line chart showing budget vs actual spend per category.
import { ref, watch, onMounted } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
	data: {
		type: Array,
		required: true,
	},
});

const containerRef = ref(null);
const selected     = ref(null);

function buildChart() {
	if (!containerRef.value || !props.data.length) return;

	// default to first category
	if (!selected.value) selected.value = props.data[0].category;

	const category = props.data.find(d => d.category === selected.value);
	if (!category) return;

	d3.select(containerRef.value).selectAll('*').remove();

	const margin = { top: 20, right: 30, bottom: 40, left: 60 };
	const width  = (containerRef.value.clientWidth || 600) - margin.left - margin.right;
	const height = 260 - margin.top - margin.bottom;

	const svg = d3.select(containerRef.value)
		.append('svg')
		.attr('width', '100%')
		.attr('height', height + margin.top + margin.bottom)
		.attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
		.append('g')
		.attr('transform', `translate(${margin.left},${margin.top})`);

	const months = category.months;
	const maxVal = d3.max(months, d => Math.max(d.actual, d.budget)) * 1.2;

	const x = d3.scalePoint()
		.domain(months.map(d => d.label))
		.range([0, width])
		.padding(0.3);

	const y = d3.scaleLinear()
		.domain([0, maxVal])
		.range([height, 0]);

	// gridlines
	svg.append('g')
		.selectAll('line')
		.data(y.ticks(4))
		.join('line')
		.attr('x1', 0).attr('x2', width)
		.attr('y1', d => y(d)).attr('y2', d => y(d))
		.attr('stroke', 'rgba(255,255,255,0.05)')
		.attr('stroke-width', 1);

	// x axis
	svg.append('g')
		.attr('transform', `translate(0,${height})`)
		.call(d3.axisBottom(x).tickSize(0))
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

	const line = d3.line()
		.x(d => x(d.label))
		.y(d => y(d.value))
		.curve(d3.curveCatmullRom);

	// budget line — flat dashed
	svg.append('path')
		.datum(months.map(d => ({ label: d.label, value: d.budget })))
		.attr('d', line)
		.attr('fill', 'none')
		.attr('stroke', '#8aaa8a')
		.attr('stroke-width', 1.5)
		.attr('stroke-dasharray', '5 4');

	// actual line
	svg.append('path')
		.datum(months.map(d => ({ label: d.label, value: d.actual })))
		.attr('d', line)
		.attr('fill', 'none')
		.attr('stroke', '#52c484')
		.attr('stroke-width', 2)
		.attr('stroke-linecap', 'round');

	// actual dots
	svg.selectAll('circle')
		.data(months)
		.join('circle')
		.attr('cx', d => x(d.label))
		.attr('cy', d => y(d.actual))
		.attr('r', 4)
		.attr('fill', d => d.actual > d.budget ? '#e05555' : '#52c484')
		.attr('stroke', '#0f110f')
		.attr('stroke-width', 2);

	// over budget labels
	months.forEach(d => {
		if (d.actual > d.budget) {
			svg.append('text')
				.attr('x', x(d.label))
				.attr('y', y(d.actual) - 10)
				.attr('text-anchor', 'middle')
				.attr('fill', '#e05555')
				.attr('font-size', '10px')
				.text('Over');
		}
	});

	// legend
	const legend = svg.append('g').attr('transform', `translate(${width - 120}, 0)`);

	legend.append('line')
		.attr('x1', 0).attr('x2', 20)
		.attr('y1', 8).attr('y2', 8)
		.attr('stroke', '#52c484')
		.attr('stroke-width', 2);
	legend.append('text')
		.attr('x', 25).attr('y', 12)
		.attr('fill', '#8aaa8a')
		.attr('font-size', '10px')
		.text('Actual');

	legend.append('line')
		.attr('x1', 0).attr('x2', 20)
		.attr('y1', 26).attr('y2', 26)
		.attr('stroke', '#8aaa8a')
		.attr('stroke-width', 1.5)
		.attr('stroke-dasharray', '5 4');
	legend.append('text')
		.attr('x', 25).attr('y', 30)
		.attr('fill', '#8aaa8a')
		.attr('font-size', '10px')
		.text('Budget');
}

onMounted(buildChart);
watch(() => [props.data, selected.value], buildChart, { deep: true });
</script>

<template>
	<div>
		<div class="buttons mb-3">
			<button
				v-for="item in data"
				:key="item.category"
				class="button is-small"
				:class="{ 'is-primary': selected === item.category }"
				@click="selected = item.category; buildChart()"
			>
				{{ item.category }}
			</button>
		</div>
		<div ref="containerRef"></div>
	</div>
</template>