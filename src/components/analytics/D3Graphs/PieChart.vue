<script setup>
// PieChart: D3 donut chart with arc tweening, adapted from Observable pattern.
import { ref, watch, onMounted } from 'vue';
import * as d3 from 'd3';
 
const props = defineProps({
	data: {
		type: Array,
		required: true,
	},
});
 
const containerRef = ref(null);
let chartNode = null;
 
function buildChart() {
	if (!containerRef.value || !props.data.length) return;
 
	// clear previous render
	d3.select(containerRef.value).selectAll('*').remove();
 
	const width       = containerRef.value.clientWidth || 400;
	const height      = Math.min(500, width / 2);
	const outerRadius = height / 2 - 10;
	const innerRadius = outerRadius * 0.75;
	const tau         = 2 * Math.PI;
	const color       = d3.scaleOrdinal(d3.schemeObservable10);
 
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
 
	function change(value) {
		pie.value(d => d[value]);
		path.data(pie);
		path.transition().duration(750).attrTween('d', arcTween);
	}
 
	function arcTween(a) {
		const i = d3.interpolate(this._current, a);
		this._current = i(0);
		return (t) => arc(i(t));
	}
 
	chartNode = Object.assign(svg.node(), { change });
	containerRef.value.appendChild(chartNode);
}
 
onMounted(buildChart);
watch(() => props.data, buildChart, { deep: true });
</script>
 
<template>
	<div ref="containerRef"></div>
</template>